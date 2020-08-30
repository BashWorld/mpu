var ATOM_INDEX = {
    OXYGEN1 : 0,
    OXYGEN2 : 1,
    HYDROGEN: 2
};
var Promises = [];
var Resolvers = [];
var WaterPromise, WaterResolver;

function initResolvers(){
    for(let i=0;i<3;i++){
        Promises[i] = new Promise((resolve,_)=>{
            Resolvers[i] = resolve;
        });
    }
    WaterPromise = new Promise((resolve,_)=>{
        WaterResolver = resolve;
    });
}

function waitForWater(){
    return new Promise((resolve,_)=>{
        Promise.all(Promises)
        .then(()=>{
            console.log("----We have water!----");
            WaterResolver("D!");
            // initResolvers();
            resolve();
        });
    });
}

function oxygenFrom1Recieved (){
    console.log("Got O1!");
    Resolvers[ATOM_INDEX.OXYGEN1]();
    return WaterPromise;
}

function oxygenFrom2Recieved (){
    console.log("Got O2!");
    Resolvers[ATOM_INDEX.OXYGEN2]();
    return WaterPromise;
}

function hydrogenRecieved (){
    console.log("Got H!");
    Resolvers[ATOM_INDEX.HYDROGEN]();
    return WaterPromise;
}

const MESSAGE_KEYS = {
    O1C : "oxygen1Created",
    O2C : "oxgen2Createad",
    HC  : "hydrogenCreated"
};

const MESSAGE_MAP = {
    [MESSAGE_KEYS.O1C] : oxygenFrom1Recieved,
    [MESSAGE_KEYS.O2C] : oxygenFrom2Recieved,
    [MESSAGE_KEYS.HC]  : hydrogenRecieved
};

initResolvers();
module.exports = {MESSAGE_KEYS, MESSAGE_MAP, waitForWater};