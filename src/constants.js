const MSG_MAP = {};

exports.getMap = function () { return MSG_MAP};

exports.addToMap = function (key,funCall){
  MSG_MAP[key] = funCall;
};
exports.removeFromMap = function(key){
    delete MSG_MAP[key];
};

let getFailureMessage = false;
exports.setFailureMessage = function(){
   getFailureMessage = true;
};
exports.unsetFailureMessage = function(){
    getFailureMessage = false;
};
exports.showFailureMessage = function(){
  return getFailureMessage;
};

let getProgressMessage = false;
exports.setProgressMessage = function(){
    getProgressMessage = true;
};
exports.unsetProgressMessage = function(){
    getProgressMessage = false;
};
exports.showProgressMessage = function(){
    return getProgressMessage;
};

let TOTAL_WORKERS = require('os').cpus().length;
exports.setTotalWorkers = function(num){
    TOTAL_WORKERS = num;
};
exports.getTotalWorkers = function(){
  return TOTAL_WORKERS;
};

exports.MSG_PREFIXES = {
    W2W : "w2w",
    W2WS : "w2ws",
    W2M : "w2m",
    M2W : "m2w",
    M2WS : "m2ws"
};

exports.SEPARATOR = "|";
exports.WORKER_ID_SEPARATOR = "_";

exports.MESSAGE_TYPE = {
    PARENT: "P",
    CHILD : "C"
};

exports.DIRECTION = {
    FORWARD  : 1,
    BACKWARD : -1
};

exports.STATUS = {
    CALLLED  : "CALLED",
    COMPLETE : "DONE",
    IN_PROCESS : "IN PROCESS",
    FAILED : "ERROR",
    SLEEP : "NOT CALLED YET",
    EX_CRISIS : "EXISTENTIAL CRISIS"
};