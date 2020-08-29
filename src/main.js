const cluster = require('cluster');

function setUpDwelling(setupConfig){
    const setupConfigKey = cluster.isMaster? "-1" : cluster.worker.id;
    const env = setupConfig[setupConfigKey];
    
}