var messageMap = {};

exports.execute = function(msg,val){
    return messageMap[msg](val);
};

exports.setSiblings = function(sibs){
    numberOfSiblings=sibs;
};

exports.setMessageMap = function(msgMap){
    messageMap=msgMap;
};

exports.getMessageMap = function(){
    return messageMap;
};