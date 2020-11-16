const cluster = require('cluster');
const LOCAL_ENV = require('./localEnv');
const addParentListeners = require('./addParentListeners');
const addChildListeners = require('./addChildListeners');

/**
 * Initialize for cluster communication, or
 * Introducing a common language for family of processes to use
 * @param {object} MESSAGE_MAP Contains key and function associated with it
 * @param {object} OPTIONS
 * @param {number} OPTIONS.FAMILY_SIZE (Excluding parent) Total number of child processes
 * @param {boolean} [OPTIONS.CREATE_FAMILY=false] Create cluster if true
 * @returns {undefined}
 */
exports.init = function (MESSAGE_MAP, {FAMILY_SIZE, CREATE_FAMILY=false}={}) {
    LOCAL_ENV.setMessageMap(MESSAGE_MAP);
    /*add listeners to master process*/
    if(cluster.isMaster){
        if(CREATE_FAMILY){
            for(let i=0;i<FAMILY_SIZE;i++)cluster.fork();
        }
        addParentListeners();   
    }
    else if(cluster.isWorker){
       addChildListeners(cluster.worker.id);
    }
    //TODO return success of failure
};