const init = require('./src/init');
const main = require('./src/main');

module.exports = {
    init : init.init,
    sendToMaster : main.sendToMaster,
    sendToSibling : main.sendToSibling,
    sendToSiblings : main.sendToSiblings
};