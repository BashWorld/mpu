const cluster = require('cluster');
const MSG_HELPER = require('./msgHelper');
const MSG_CONSTANTS = require('./constants');
const executeMessage = require('./executeMessage'); 

function isValidSibling(siblingId){
    return cluster.workers[siblingId] !== undefined;
}

function forwardMessageToSibling(message, worker){
    const siblingId = MSG_HELPER.getSiblingId(message);
    if(isValidSibling(siblingId)){
        cluster.workers[siblingId].send(message);
    }
    else{
        worker.send(MSG_CONSTANTS.ERROR_MESSAGE.SIBLING_MIA);
    }
}

function forwardMessageToGivenSiblings(message, worker){
    const siblingIds = MSG_HELPER.getSiblingIds(message);
    const validSiblingIds = siblingIds.filter(isValidSibling);
    if(MSG_HELPER.ignoreChecks(message)){
        MSG_HELPER.setSiblingIds(message, validSiblingIds);
        validSiblingIds.forEach(siblingId => {
            cluster.workers[siblingId].send(message);
        });
    }
    else{
        if(siblingIds.length === validSiblingIds.length){
            siblingIds.forEach(siblingId => {
                cluster.workers[siblingId].send(message);
            });    
        }
        else{
            worker.send(MSG_CONSTANTS.ERROR_MESSAGE.SIBLINGS_MIA);
        }
    }
}

function forwardMessageToAllSiblings(message){
    for(const workerId in cluster.workers){
        cluster.workers[workerId].send(message);
    }
}

function forwardMessage(message,worker){
    if(MSG_HELPER.isMessageForParent(message)){
        executeMessage(message,worker);
    }
    else if(MSG_HELPER.isMessageForAllSiblings(message)){
        forwardMessageToAllSiblings(message);
    }
    else if(MSG_HELPER.isMessageForSiblings(message)){
        forwardMessageToGivenSiblings(message,worker);
    }
    else if(MSG_HELPER.isMessageForSibling(message)){
        forwardMessageToSibling(message,worker)
    }
    else{
        worker.send(MSG_CONSTANTS.ERROR_MESSAGE.INVALID_MSG);
    }
}

function sendBackMessage(message){
    if(MSG_HELPER.isMessageGoingBackToSibling(message)){
        const siblingId = MSG_HELPER.getSourceSiblingId(message);
        if(MSG_HELPER.isMessageForAllSiblings(message)){
            message.dest.numOfWorkers = Object.keys(cluster.workers).length;
        }
        cluster.workers[siblingId].send(message);
    }
}

function addParentListeners(){
    for(let workerId in cluster.workers){
        let worker = cluster.workers[workerId];
        worker.on('message', function (message) {
            if(MSG_HELPER.isGoingForward(message)){
                forwardMessage(message,worker);
            }
            else{
                sendBackMessage(message);
            }
        });
    }
}

module.exports = addParentListeners;