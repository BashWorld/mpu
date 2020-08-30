/*
* jobs tracked by each worker
* */
const constants = require('./constants');
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
        tracker[key] = {resolve,reject};
    });
};

exports.stopTracking = function ({msg:key,status}) {
    if(key in tracker){
        if(status === constants.STATUS.COMPLETE){
            tracker[key].resolve();
        }
        else{
            tracker[key].reject();
        }
    }
};

exports.removeTracker = function (key) {
    return tracker.delete(key);
};