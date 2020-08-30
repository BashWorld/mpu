let cluster = require('cluster');
let messageConstants = require('./constants');
let msgHelper = require('./messageHelper');
const LOCAL_ENV = require('./localEnv');
const JOB_TRACKER = require('./jobTracker');

function executeMessage (message,recipient=process){
    const {msg,val} = message;
    //check if msg not there
    function updateMessage(status,obj){
        message.dir = messageConstants.DIRECTION.BACKWARD;
        message.status = status;
        Object.assign(message,obj);
        return message;
    }
    return LOCAL_ENV.execute(msg,val)
        .then(function(result){
            recipient.send(updateMessage(messageConstants.STATUS.COMPLETE,{result}));
        })
        .catch(function (err) {
            recipient.send(updateMessage(messageConstants.STATUS.FAILED,{error:err}));
        });
}

function addParentListeners(){
    for(let workerId in cluster.workers){
        let worker = cluster.workers[workerId];
        worker.on('message', function (message) {
            if(msgHelper.isGoingForward(message)){
                if(msgHelper.isMessageForParent(message)){
                    executeMessage(message,worker);
                }
                else if(msgHelper.isMessageForSibling(message)){
                    let siblingId = msgHelper.getSiblingId(message);
                    if(LOCAL_ENV.isValidSibling(siblingId)){
                        cluster.workers[siblingId].send(message);
                    }
                    else{
                        message.status = messageConstants.STATUS.EX_CRISIS;
                        message.error  = {stack:"Invalid Sibling ID!"};
                        worker.send(message);
                    }
                }
            }
            else{
                if(msgHelper.isMessageGoingBackToSibling(message)){
                    let siblingId = msgHelper.getSourceSiblingId(message);
                    cluster.workers[siblingId].send(message);
                }
            }
        });
    }
}

/**
 *
 * @param {object} params.COMMON_MAP 
 * @param {number} params.FAMILY_SIZE - (Excluding parent) Total number of child processes
 */
exports.init = function ({MESSAGE_MAP, FAMILY_SIZE, CREATE_FAMILY=false}) {
    LOCAL_ENV.setMessageMap(MESSAGE_MAP);
    LOCAL_ENV.setSiblings(FAMILY_SIZE);
    /*add listeners to master process*/
    if(cluster.isMaster){
        if(CREATE_FAMILY){
            for(let i=0;i<FAMILY_SIZE;i++)cluster.fork();
        }
        addParentListeners();   
    }
    else if(cluster.isWorker){
        process.on('message',function (message) {
            if(msgHelper.isGoingForward(message)){
                if(msgHelper.isMessageForThisChild(cluster.worker.id,message)){
                    executeMessage(message);
                }
            }
            else{
                JOB_TRACKER.stopTracking(message);
            }
        });
    }
};