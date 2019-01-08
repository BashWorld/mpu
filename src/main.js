let Q = require('q');
let cluster = require('cluster');
let constants = require('./constants');
let msgHelper = require('./messageHelper');
let tracker = require('./jobTracker');

let printMessage = function(callFn, message){
  callFn("Worker "+cluster.worker.id+"("+process.pid+") := "+message);
};

/**
 * @param {string} message
 */
exports.w2ws = function(message){
    let defer = Q.defer();
    try {
        if (cluster.isWorker) {
            if (!tracker.getTrackerStatus(message)) {
                let msg = msgHelper.composeW2WSMsg(message);
                tracker.startTracking(message);
                process.send(msg);
                let handlerFunction, timeoutFunction;
                handlerFunction = function () {
                    try {
                        if (tracker.getTrackerStatus(message) === constants.STATUS.COMPLETE) {
                            tracker.removeTracker(message);
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