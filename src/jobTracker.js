/*
* jobs tracked by each worker
* */
const constants = require('./constants');
const tracker = {};

exports.getTracker = function(){
    return tracker;
}

exports.getTrackerStatus = function(key){
  if(key in tracker){
      return tracker[key];
  }
  return null;
};

exports.startTracking = function (key) {
  tracker[key] = constants.STATUS.IN_PROCESS;
};

exports.stopTracking = function (key) {
    if(key in tracker){
        tracker[key] = constants.STATUS.COMPLETE;
    }
};

exports.removeTracker = function (key) {
    if(key in tracker){
        delete tracker[key];
    }
};