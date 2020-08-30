let cluster = require('cluster');
let messageConstants = require('./constants');
let msgHelper = require('./messageHelper');
const LOCAL_ENV = require('./localEnv');
const JOB_TRACKER = require('./jobTracker');

function executeMessage ({msg},recipient=process){
    //check if msg not there
    function updateMessage(status,obj){
        message.dir = messageConstants.DIRECTION.BACKWARD;
        message.status = status;
        Object.assign(message,obj);
        return message;
    }
    return LOCAL_ENV.execute[msg]()
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
            console.log("M");
            console.log(message);
            console.log();
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
exports.init = function ({COMMON_MAP, FAMILY_SIZE}) {
    LOCAL_ENV.setMessageMap(COMMON_MAP);
    LOCAL_ENV.setSiblings(FAMILY_SIZE);
    /*add listeners to master process*/
    if(cluster.isMaster){
        addParentListeners();   
    }
    else if(cluster.isWorker){
        console.log("W");
        console.log(message);
        console.log();
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