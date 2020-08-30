let cluster = require('cluster');
let constants = require('./constants');
let msgHelper = require('./messageHelper');
let tracker = require('./jobTracker');

let printMessage = function(callFn, message){
  callFn("Worker "+cluster.worker.id+"("+process.pid+") := "+message);
};

let mphelper = function(params){
    let message = params.message;
    let checkFlag = params.checkFlag;
    let keyMakerFn = params.keyMakerFn;
    let worker = params.worker;
    let defer = Q.defer();
    try {
        if (checkFlag) {
            let msg = keyMakerFn(message);
            if (!tracker.getTrackerStatus(msg)) {
                tracker.startTracking(msg);
                worker.send(msg);
                let handlerFunction, timeoutFunction;
                handlerFunction = function () {
                    try {
                        if (tracker.getTrackerStatus(msg) === constants.STATUS.COMPLETE) {
                            tracker.removeTracker(msg);
                            defer.resolve()
                        } else {
                            if (constants.showProgressMessage()) {
                                printMessage(console.log, constants.STATUS.IN_PROCESS);
                            }
                            timeoutFunction();
                        }
                    }
                    catch (err) {
                        if (constants.showFailureMessage()) {
                            printMessage(console.error, " setTimeout error. "+err);
                        }
                    }
                };
                timeoutFunction = function () {
                    setTimeout(handlerFunction, constants.getTimeout());
                };
                timeoutFunction();
            } else {
                if (constants.showFailureMessage()) {
                    printMessage(console.error, " Already started '" + message + "'");
                }
                defer.resolve(constants.STATUS.EX_CRISIS);
            }
        } else {
            defer.resolve();
        }
    }
    catch(err){
        defer.reject(err);
    }
    return defer.promise;
};

let composeWorkerParams = function (message,kerMaker){
    return {message:message,checkFlag:cluster.isWorker,keyMakerFn:kerMaker,worker:cluster.worker};
};
let composeMasterParams = function (message,kerMaker,workerId){
    if(cluster.isMaster)
    {
        let tempWorkerId = workerId || 1;
        let worker = cluster.workers[tempWorkerId];
        return {message: message, checkFlag: cluster.isMaster, keyMakerFn: kerMaker, worker: worker};
    }
    return {message: message, checkFlag: cluster.isMaster, keyMakerFn: kerMaker};
};
/**
 * @param {string} message
 */
exports.w2ws = function(message){
    return mphelper(composeWorkerParams(message,msgHelper.composeW2WSMsg));
};

exports.w2m = function(message){
    return mphelper(composeWorkerParams(message,msgHelper.composeW2MMsg));
};

exports.m2w = function(message,workerId){
    return mphelper(composeMasterParams(message,msgHelper.composeM2WMsg,workerId));
};
exports.sendToSibling = function({siblingId, message, value}){
    let pr = tracker.startTracking(message);
    let msg = {
        msg: message,
        dir: constants.DIRECTION.FORWARD,
        val: value,
        src: {type: constants.MESSAGE_TYPE.CHILD, id: cluster.worker.id},
        dest:{type: constants.MESSAGE_TYPE.CHILD, id: siblingId},
    };
    process.send(msg);
    return pr;
};