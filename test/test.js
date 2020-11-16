let os = require('os');
let mpu = require('../index');
let cluster = require('cluster');
let totalWorkers = 3;

function logWithTabs(workerId,message){
    const tabString = '\t\t\t'.repeat(workerId-1);
    console.log(tabString+message);
}

let FUN_KEY = "CHECK";
let MSG_MAP = {
    [FUN_KEY]: (workerId) => {
        logWithTabs(workerId,`[${workerId}] In Worker ${cluster.worker.id}`);
        return Promise.resolve();
    }
};

function init(){
    mpu.init(MSG_MAP,{FAMILY_SIZE:totalWorkers});
}

if(cluster.isMaster){
    for(let i = 0;i<totalWorkers;++i){
        cluster.fork();
    }
    init();
}
else if(cluster.isWorker){
    init();
    logWithTabs(cluster.worker.id,`[${cluster.worker.id}] Start`);
    mpu.sendToSiblings({message:FUN_KEY, siblingIds:-1, value:cluster.worker.id})
        .then(function (){
            logWithTabs(cluster.worker.id,`[${cluster.worker.id}] End`);
            cluster.worker.disconnect();
        });
}