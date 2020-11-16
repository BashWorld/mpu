const cluster = require('cluster');
const mpu = require("../../index");

const REQUESTS = {};
const MOLECULE = {PROMISE:null,RESOLVE:null,COUNT:0};
const MESSAGE_KEYS = {}, MESSAGE_MAP = {};
const ATOM_CALLS = {}, REQUIRED_ATOMS = {};

function waitASec(){
    return new Promise((resolve,_)=>{
        setTimeout(()=>{
            resolve();
        },1000)
    });
}

function genTabString(count){
    let tabStrig = "";
    for(let i=0;i<6*count;i++) tabStrig+="\t";
    return tabStrig;
}

function log(msg){
    console.log(`${MOLECULE.TAB_STRING}[Child ${cluster.worker.id}]: ${msg}`);
}

function resetResolvers(){
    for(let key in REQUESTS){
        REQUESTS[key].PROMISE = new Promise((resolve,_)=>REQUESTS[key].RESOLVE=resolve);
    }
    MOLECULE.PROMISE = new Promise((resolve,_)=>MOLECULE.RESOLVE=resolve);
}

function waitForMolecule(){
    return new Promise((resolve,_)=>{
        Promise.all(Object.values(REQUESTS).map(({PROMISE})=>PROMISE))
        .then(()=>{
            MOLECULE.COUNT++;
            log(`${MOLECULE.FORMULA} created #${MOLECULE.COUNT}`);
            MOLECULE.RESOLVE(MOLECULE.COUNT);
            resolve();
            resetResolvers();
        });
    });
}

async function perpetualMoleculeCreation() {
    while(true) {
        await waitForMolecule();
        await waitASec();
    }
} 

function perpetualAtomCreation(atom,msg_key,tabString){
    return async function(){
        let atomCount = 0;
        while(true){
            atomCount++;
            console.log(`${tabString}[Child ${cluster.worker.id}]: created ${atom}-atom #${atomCount}`);
            let moleculeCount = await mpu.sendToSibling({siblingId:4,message:msg_key,value:atomCount});
            console.log(`${tabString}[Child ${cluster.worker.id}]: ${atom}-atom #${atomCount} constitues molecule #${moleculeCount}`);
        }
    };
}

function setUp(){
    let tab = 0;
    for(let ATOM in REQUIRED_ATOMS){
        let atomConfig = REQUIRED_ATOMS[ATOM];
        for(let i=0;i<atomConfig.QTY;i++){
            const key = ATOM+i;
            MESSAGE_KEYS[key] = key;
            MESSAGE_MAP [key] = function (atomCount) {
                log(`Recieved ${atomConfig.SYMBOL}-atom #${atomCount}`);
                REQUESTS[key].RESOLVE();
                return MOLECULE.PROMISE;
            };
            let PROMISE, RESOLVE;
            PROMISE = new Promise((resolve,_)=>RESOLVE=resolve);
            REQUESTS[key] = {PROMISE,RESOLVE};
            ATOM_CALLS[key] = perpetualAtomCreation(atomConfig.SYMBOL,key,genTabString(tab++));
        }
    }
    MOLECULE.PROMISE = new Promise((resolve,_)=>MOLECULE.RESOLVE=resolve);
    MOLECULE.TAB_STRING = genTabString(tab);
};

const DEFAULT_ATOM = {
    HYDROGEN : {QTY : 1, SYMBOL: "H"},
    OXYGEN   : {QTY : 2, SYMBOL: "O"},
};
const DEFAULT_FORMULA = "H20";

module.exports = function(ATOMS_INFO = DEFAULT_ATOM,FORMULA = DEFAULT_FORMULA){
    Object.assign(REQUIRED_ATOMS,ATOMS_INFO);
    MOLECULE.FORMULA=FORMULA;
    setUp();
    return {MESSAGE_MAP, ATOM_CALLS, perpetualMoleculeCreation};
};