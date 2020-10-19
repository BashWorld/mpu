let messageConstants = require('./constants');
const LOCAL_ENV = require('./localEnv');

function executeMessage (message,recipient=process){
    const {msg,val} = message;
    //check if msg not there
    function updateMessage(status,obj){
        message.dir = messageConstants.DIRECTION.BACKWARD;
        message.status = status;
        Object.assign(message,obj);
        return message;
    }
    return LOCAL_ENV.execute(msg,val)
        .then(function(result){
            recipient.send(updateMessage(messageConstants.STATUS.COMPLETE,{result}));
        })
        .catch(function (err) {
            recipient.send(updateMessage(messageConstants.STATUS.FAILED,{error:err}));
        });
}
module.exports = executeMessage;