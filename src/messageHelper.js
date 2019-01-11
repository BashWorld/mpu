const SEPARATOR = require('./constants').SEPARATOR;
const WORKER_ID_SEPARATOR = require('./constants').WORKER_ID_SEPARATOR;
const MSG_PREFIXES = require('./constants').MSG_PREFIXES;

/*
* Assuming every message that is passed in the cluster has the following format
<TYPE>|<MESSAGE>[_<WORKER_ID>][|<STATUS>]
* */

exports.composeMessage = function(msgs){
    return msgs.join(SEPARATOR);
};

exports.addToMessage = function(msg, addStr){
    return msg+SEPARATOR+addStr;
};

exports.shatterMessage = function(msg,sep){
    return msg.split(sep || SEPARATOR);
};

exports.getTillMessage = function(msg){
    return this.shatterMessage(this.shatterMessage(msg).slice(0,2).join(SEPARATOR),WORKER_ID_SEPARATOR)[0];
};
exports.getMessage = function(msg){
    return this.shatterMessage(this.shatterMessage(msg)[1],WORKER_ID_SEPARATOR)[0];
};
exports.addWorkerId = function(msg,id){
  return msg+WORKER_ID_SEPARATOR+id;
};
exports.getWorkerId = function(msg){
    return this.shatterMessage(this.shatterMessage(msg)[1],WORKER_ID_SEPARATOR)[1];
};
exports.getStatus = function(msg){
  return this.shatterMessage(msg)[2];
};

let checkType = function (type){
    return function(msg){
        return (this.shatterMessage(msg)[0] === type);
    };
};
let composeMsg = function(type){
    return function(msg){
        return type+SEPARATOR+msg;
    };
};
(function addToExports(){
    for(let key in MSG_PREFIXES){
        exports["is"+key] = checkType(MSG_PREFIXES[key]);
        exports["compose"+key+"Msg"] = composeMsg(MSG_PREFIXES[key]);
    }
})();