const cluster = require('cluster');
const mpu = require("../../index");
const {MESSAGE_KEYS, MESSAGE_MAP, waitForWater, initResolvers} = require("./helper");

function perpetualCreation(atom,msg_key,value){
    console.log(`Child ${cluster.worker.id}: created ${atom}-atom!`);
    return mpu.sendToSibling({siblingId:4,message:msg_key,value})
            .then((reply)=>{
                console.log(`Child ${cluster.worker.id}: recieved water! H2O count := ${reply}`)
                cluster.worker.disconnect();
            });
}
if(cluster.isMaster){
    for(let i=0;i<4;i++)cluster.fork();
    mpu.init({MESSAGE_MAP, FAMILY_SIZE:4});
}
else if(cluster.isWorker){
    mpu.init({MESSAGE_MAP, FAMILY_SIZE:4});
    switch(cluster.worker.id){
        case 1: perpetualCreation("Oxygen",MESSAGE_KEYS.O1C); break;
        case 2: perpetualCreation("Oxygen",MESSAGE_KEYS.O2C); break;
        case 3: perpetualCreation("Hydrogen",MESSAGE_KEYS.HC); break;
        case 4: 
            initResolvers();
            waitForWater().then(()=>{
                console.log("Got Water!");
                cluster.worker.disconnect();
            });
            break;
        default: console.log("Unexpected child creation")
    }
}