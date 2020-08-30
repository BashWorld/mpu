const cluster = require('cluster');
const mpu = require("../../index");
const {MESSAGE_KEYS, MESSAGE_MAP, waitForWater} = require("./helper");

function perpetualCreation(atom,msg_key){
    console.log(`${atom}-created!`);
    return mpu.sendToSibling({siblingId:4,message:msg_key});
}

if(cluster.isMaster){
    for(let i=0;i<4;i++)cluster.fork();
    mpu.init({MESSAGE_MAP, FAMILY_SIZE:4});
}
else if(cluster.isWorker){
    mpu.init({MESSAGE_MAP, FAMILY_SIZE:4});
    switch(cluster.worker.id){
        case 1: perpetualCreation("Oxygen",MESSAGE_KEYS.O1C).then(msg=>console.log("O1",msg)); break;
        case 2: perpetualCreation("Oxygen",MESSAGE_KEYS.O2C).then(msg=>console.log("O2",msg)); break;
        case 3: perpetualCreation("Hydrogen",MESSAGE_KEYS.HC).then(msg=>console.log("H3",msg)); break;
        case 4: 
            waitForWater().then(()=>console.log("Got Water!"));
            break;
        default: console.log("Unexpected child! :p")
    }
}