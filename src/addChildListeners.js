let msgHelper = require('./messageHelper');
const JOB_TRACKER = require('./jobTracker');
const executeMessage = require('./executeMessage');
const cluster = require('cluster');

function addChildListeners(){
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

module.exports = addChildListeners;