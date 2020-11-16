const DIRECTION = require('./constants').DIRECTION;
const MESSAGE_TYPE = require('./constants').MESSAGE_TYPE;

/*
* Assuming every message that is passed in the cluster has the following format
* <TYPE>|<MESSAGE>[_<WORKER_ID>][|<STATUS>]
* {src:{type:"parent|child", id:"worker id"},dest:{type:"parent|sibling",id:"worker id"[,ids:[]]},msg:"",status:"",value:"",dir:"",byPassCheck:false}
* */

exports.isMessageForParent = function({dest:{type}}){
    return type === MESSAGE_TYPE.PARENT;
};
exports.isMessageForThisChild = function(childId,{dest:{id,ids}}){
    return ids? (ids.length? ids.includes(childId): ids===-1):id===childId;
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
exports.isMessageForAllSiblings = function({dest:{type,ids}}){
    return type === MESSAGE_TYPE.CHILD && ids === -1;
}
exports.isMessageForSiblings = function({dest:{type,ids}}){
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
exports.setSiblingIds = function(message, siblingIds){
    return message.dest.ids = siblingIds;
}
exports.getSourceSiblingId = function({src:{id}}){
    return id;
}
exports.getMessage = function({msg}){
    return msg;
}
exports.getMessageFrom = function({from}){
    return from;
}
exports.getNumOfMessagesSent = function({dest:{numOfWorkers,ids}}){
    return numOfWorkers? numOfWorkers : ids.length;
}
exports.ignoreChecks = function({byPassCheck=false}){
    return byPassCheck;
}