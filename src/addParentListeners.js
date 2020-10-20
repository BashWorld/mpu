const messageConstants = require('./constants');
const msgHelper = require('./messageHelper');
const executeMessage = require('./executeMessage'); 
const LOCAL_ENV = require('./localEnv');
const cluster = require('cluster');

function forwarding(message,worker){
    if(msgHelper.isMessageForParent(message)){
        executeMessage(message,worker);
    }
    else if(msgHelper.isMessageForAllSiblings(message)){
        for(const worker in cluster.workers){
            worker.send(message);
        }
    }
    else if(msgHelper.isMessageForSiblings(message)){
        const siblingIds = msgHelper.getSiblingIds(message);
        siblingIds.forEach(siblingId => {
            cluster.workers[siblingId].send(message);
        });
    }
    else if(msgHelper.isMessageForSibling(message)){
        const siblingId = msgHelper.getSiblingId(message);
        if(LOCAL_ENV.isValidSibling(siblingId)){
            cluster.workers[siblingId].send(message);
        }
        else{
            message.status = messageConstants.STATUS.EX_CRISIS;
            message.error  = {message:"Invalid Sibling ID!"};
            worker.send(message);
        }
    }
    else{
        message.status = messageConstants.STATUS.EX_CRISIS;
        message.error  = {message:"Invalid Message Type!"};
        worker.send(message);
    }
}

function reversion(message){
    if(msgHelper.isMessageGoingBackToSibling(message)){
        const siblingId = msgHelper.getSourceSiblingId(message);
        if(msgHelper.isMessageForAllSiblings(message)){
            message.dest.numOfWorkers = Object.keys(cluster.workers).length;
        }
        cluster.workers[siblingId].send(message);
    }
}

function addParentListeners(){
    for(let workerId in cluster.workers){
        let worker = cluster.workers[workerId];
        worker.on('message', function (message) {
            if(msgHelper.isGoingForward(message)){
                forwarding(message,worker);
            }
            else{
                reversion(message);
            }
        });
    }
}

module.exports = addParentListeners;