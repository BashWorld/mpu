const MESSAGE_TYPE = require('./constants').MESSAGE_TYPE;
const SEPARATOR = require('./constants').SEPARATOR;
const WORKER_ID_SEPARATOR = require('./constants').WORKER_ID_SEPARATOR;
const MSG_PREFIXES = require('./constants').MSG_PREFIXES;
const DIRECTION = require('./constants').DIRECTION;
/*
* Assuming every message that is passed in the cluster has the following format
* <TYPE>|<MESSAGE>[_<WORKER_ID>][|<STATUS>]
* {src:{type:"parent|child", id:"worker id"},dest:{type:"parent|sibling",id:[]},msg:"",status:""}
* */
exports.isMessageForParent = function({dest:{type}}){
    return type === MESSAGE_TYPE.PARENT;
};
exports.isMessageForThisChild = function(childId,{dest:{id}}){
    return id===childId;
};
exports.isGoingForward = function({dir}){
    return dir === DIRECTION.FORWARD;
};
exports.isGoingBackward = function({dir}){
    return dir === DIRECTION.BACKWARD;
};
exports.isMessageForSibling = function({dest:{type}}){
    return type === MESSAGE_TYPE.CHILD;
}
exports.isMessageForAllSiblings = function({dest:{type,id}}){
    return type === MESSAGE_TYPE.CHILD && id === -1;
}
exports.isMessageForSiblings = function({dest:{type,id}}){
    return type === MESSAGE_TYPE.CHILD && ids && ids.length > 0;
}
exports.isMessageGoingBackToSibling = function({src:{type}}){
    return type === MESSAGE_TYPE.CHILD;
};
exports.getSiblingId = function({dest:{id}}){
    return id;
}
exports.getSiblingIds = function({dest:{ids}}){
    return ids;
}
exports.getSourceSiblingId = function({src:{id}}){
    return id;
}

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