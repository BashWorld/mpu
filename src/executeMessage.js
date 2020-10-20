let messageConstants = require('./constants');
const cluster = require('cluster');
const LOCAL_ENV = require('./localEnv');

function executeMessage (message,recipient=process){
    const {msg,val} = message;
    //check if msg not there
    function updateMessage(status,obj){
        message.dir = messageConstants.DIRECTION.BACKWARD;
        message.status = status;
        if(cluster.isWorker) message.from = cluster.worker.id;
        Object.assign(message,obj);
        return message;
    }
    try {
        const result = LOCAL_ENV.execute(msg,val);
        if(result.then){
            result.then(function(result){
                recipient.send(updateMessage(messageConstants.STATUS.COMPLETE,{result}));
            })
            .catch(function (error) {
                recipient.send(updateMessage(messageConstants.STATUS.FAILED,{error}));
            });
        }
        else recipient.send(updateMessage(messageConstants.STATUS.COMPLETE,{result}));
    }
    catch({message,stack,code}){
        recipient.send(updateMessage(messageConstants.STATUS.FAILED,{error:{message,stack,code}}));
    }
    
    return Promise.resolve()
        
}
module.exports = executeMessage;