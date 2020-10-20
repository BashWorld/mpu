/*
* jobs tracked by each worker
* */
const constants = require('./constants');
const msgHelper = require('./messageHelper');
const tracker = new Map();

exports.getTracker = function(){
    return tracker;
}

exports.getTrackerStatus = function(key){
  if(key in tracker){
      constants.STATUS.IN_PROCESS;
  }
  return constants.STATUS.EX_CRISIS;
};

exports.startTracking = function (message) {
    const key = msgHelper.getMessage(message);
    let set = msgHelper.isMessageForSiblings(message) || msgHelper.isMessageForAllSiblings(message) ? 
                {flag:true,  value:new Set(), replies:[]} : 
                {flag:false, value:null} ;
    return new Promise((resolve,reject)=>{
        tracker.set(key,{resolve,reject,set});
    });
};

exports.stopTracking = function (message) {
    let {msg:key,status,result,error} = message;
    if(tracker.has(key)){
        const trackerObj = tracker.get(key);
        if(trackerObj.set.flag){
            const fromWorker = msgHelper.getMessageFrom(message);
            trackerObj.set.value.add(fromWorker);
            trackerObj.set.replies.push(error?error:result);
            if(msgHelper.getNumOfMessagesSent(message) !== trackerObj.set.value.size) return;
            result=error=trackerObj.set.replies;
        }
        if(status === constants.STATUS.COMPLETE){
            trackerObj.resolve(result);
        }
        else{
            trackerObj.reject(error);
        }
    }
    tracker.delete(key)
};