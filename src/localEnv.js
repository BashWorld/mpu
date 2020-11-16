var messageMap = {};

exports.execute = function(msg,val){
    return messageMap[msg](val);
};

exports.setMessageMap = function(msgMap){
    messageMap=msgMap;
};

exports.getMessageMap = function(){
    return messageMap;
};