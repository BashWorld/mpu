const cluster = require('cluster');
const mpu = require("../../index");

const ATOM = {
    HYDROGEN : {QTY : 1, SYMBOL: "H"},
    OXYGEN   : {QTY : 2, SYMBOL: "O"},
};
const FORMULA = "H2O";
const {MESSAGE_MAP,ATOM_CALLS,perpetualMoleculeCreation} = require("./helper")(ATOM,FORMULA);

function startCluster(){
    const ATOM_KEYS = Object.keys(ATOM_CALLS);
    const children = ATOM_KEYS.length + 1;
    if(cluster.isMaster){
        for(let i=0; i<children; i++) cluster.fork();
        mpu.init(MESSAGE_MAP,{FAMILY_SIZE:children});
    }
    else if(cluster.isWorker){
        mpu.init(MESSAGE_MAP,{FAMILY_SIZE:children});
        if(cluster.worker.id === children){
            perpetualMoleculeCreation();
        }
        else{
            ATOM_CALLS[ATOM_KEYS[cluster.worker.id-1]]();
        }
    }
}
startCluster();