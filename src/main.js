const cluster = require('cluster');
const tracker = require('./jobTracker');
const constants = require('./constants');
const LOCAL_ENV = require('./localEnv');

function getSource(){
    return cluster.isMaster? 
        {type: constants.MESSAGE_TYPE.PARENT} : 
        {type: constants.MESSAGE_TYPE.CHILD, id:cluster.worker.id}
}

exports.sendToMaster = function({message, value}){
    const source = getSource();
    if(source === constants.MESSAGE_TYPE.PARENT){
        //TODO handle master to master
    }
    let msg = {
        msg: message,
        dir: constants.DIRECTION.FORWARD,
        val: value,
        src: source,
        dest:{type: constants.MESSAGE_TYPE.PARENT},
    };
    let pr = tracker.startTracking(msg);
    process.send(msg);
    return pr;
};

exports.sendToSiblings = function({siblingIds, message, value, ignoreCheck=false}){
    let msg = {
        msg: message,
        dir: constants.DIRECTION.FORWARD,
        val: value,
        src: getSource(),
        byPassCheck: ignoreCheck,
        dest:{type: constants.MESSAGE_TYPE.CHILD, ids: siblingIds},
    };
    let pr = tracker.startTracking(msg);
    process.send(msg);
    return pr;
};

exports.sendToSibling = function({siblingId, message, value}){
    let msg = {
        msg: message,
        dir: constants.DIRECTION.FORWARD,
        val: value,
        src: getSource(),
        dest:{type: constants.MESSAGE_TYPE.CHILD, id: siblingId},
    };
    let pr = tracker.startTracking(msg);
    process.send(msg);
    return pr;
};