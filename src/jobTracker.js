/*
* jobs tracked by each worker
* */
const constants = require('./constants');
const { messageMap } = require('./localEnv');
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

exports.startTracking = function (key) {
    return new Promise((resolve,reject)=>{
        tracker.set(key,{resolve,reject});
    });
};

exports.stopTracking = function (message) {
    let {msg:key,status,result,error} = message;
    if(tracker.has(key)){
        if(status === constants.STATUS.COMPLETE){
            tracker.get(key).resolve(result);
        }
        else{
            tracker.get(key).reject(error);
        }
    }
    tracker.delete(key)
};