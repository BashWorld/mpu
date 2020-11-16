const MSG_HELPER  = require('./msgHelper');
const JOB_TRACKER = require('./jobTracker');
const executeMessage = require('./executeMessage');

function addChildListeners(childId){
    process.on('message',function (message) {
        if(MSG_HELPER.isGoingForward(message)){
            if(MSG_HELPER.isMessageForThisChild(childId,message)){
                executeMessage(message);
            }
        }
        else{
            JOB_TRACKER.stopTracking(message);
        }
    });
}

module.exports = addChildListeners;