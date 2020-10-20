const cluster = require('cluster');
const mpu = require("../../index");

const CHILDREN = 3;
const MESSAGE_MAP = {
    "ping" : () => ({msg:"pong",from:cluster.worker.id}),
    "pong" : () => ({msg:"pong",from:'master',pid:process.pid}),
};

if(cluster.isMaster){
    for(let i=0; i<CHILDREN; i++) cluster.fork();
    mpu.init(MESSAGE_MAP,{FAMILY_SIZE:CHILDREN});
}
else if(cluster.isWorker){
    mpu.init(MESSAGE_MAP,{FAMILY_SIZE:CHILDREN});
    if(cluster.worker.id === 1){
        mpu.sendToSibling({siblingId:2,message:"ping"})
        .then(reply => console.log(`Child ${cluster.worker.id} send ping to child , got reply: ${JSON.stringify(reply)}`));
    }
    else if(cluster.worker.id === 2){
        mpu.sendToMaster({message:"ping"})
        .catch(error => console.log(`Child ${cluster.worker.id} send ping to master, got error: ${error.message}`));
    }
    else 
    {
        mpu.sendToSiblings({siblingIds:[1,2],message:"ping"})
        .then(reply => console.log(`Child ${cluster.worker.id} got reply: ${JSON.stringify(reply)}`));
    }
}