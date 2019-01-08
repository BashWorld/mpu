let cluster = require('cluster');
let messageConstants = require('./constants');
let msgHelper = require('./messageHelper');

let callFunc = function (msg){
    const MSG_MAP = require('./constants').getMap();
    let msgConst = msgHelper.getMessage(msg);
    let promise;
    if(MSG_MAP[msgConst]) promise = MSG_MAP[msgConst]();
    else promise = Promise.reject(messageConstants.STATUS.EX_CRISIS);
    return promise
        .catch(function (err) {
            if(messageConstants.showFailureMessage())
                console.error("Message Failure:",msgHelper.getMessage(msg)+" : ERROR :=",err);
            return messageConstants.STATUS.FAILED;
        });
};

/**
 *
 * @param {object} params.MSG_MAP
 * @param {number} params.TIMEOUT
 * @param {number} params.WORKERS
 */
exports.init = function (params) {
    let input = params || {};
    let map = input.MSG_MAP || {};
    let timeout = input.TIMEOUT || messageConstants.getTimeout();
    let number_of_workers = input.WORKERS || messageConstants.getTotalWorkers();
    for(let key in map){
        messageConstants.addToMap(key,map[key]);
    }
    messageConstants.setTotalWorkers(number_of_workers);
    messageConstants.setTimeout(timeout);
    /*add listeners to master process*/
    if(cluster.isMaster){
        const COUNTERS = {};
        for(let i in cluster.workers){
            let worker = cluster.workers[i];
            worker.on('message', function (message) {
                if(msgHelper.isW2M(message)){
                    callFunc(message)
                        .then(function(status){
                            worker.send(msgHelper.addToMessage(message,messageConstants.STATUS.COMPLETE));
                        });
                }
                else if(msgHelper.isW2WS(message)){
                    let messageKey = msgHelper.getMessage(message);
                    if(!msgHelper.getWorkerId(message)){
                        //send to all workers
                        let updatedMessage = msgHelper.addWorkerId(message,worker.id);
                        if(COUNTERS[messageKey]){
                            //already one is being executed, don't execute this call
                            worker.send(msgHelper.addToMessage(message,messageConstants.STATUS.IN_PROCESS));
                        }
                        else{
                            COUNTERS[messageKey] = {ID : worker.id, COUNT : 0};
                            for(let j in cluster.workers){
                                cluster.workers[j].send(updatedMessage);
                            }
                        }
                    }
                    else{
                        COUNTERS[messageKey].COUNT+=1;
                        if(COUNTERS[messageKey].COUNT === messageConstants.getTotalWorkers()){
                            delete COUNTERS[messageKey];
                            cluster.workers[msgHelper.getWorkerId(message)].send(message);
                        }
                    }
                }
            });
        }
    }
    else if(cluster.isWorker){
        process.on('message',function (message) {
           if(msgHelper.isW2WS(message)){
               let status = msgHelper.getStatus(message);
               if(status){
                   // it's done
                    require('./jobTracker').stopTracking(msgHelper.getMessage(message));
               }
               else{
                   callFunc(message)
                       .then(function(status){
                           process.send(msgHelper.addToMessage(message,messageConstants.STATUS.COMPLETE));
                       });
               }
           }
        });
    }
};