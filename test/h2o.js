const cluster = require('cluster');
const mpu = require("../index");

class WaterScrew {
    constructor(){
        this.initResolvers();
    }
    initResolvers(){
        this.O1R = new Promise((resolve,_)=>{
            this.O1R = () => resolve();
        });
        this.O2P = new Promise((resolve,_)=>{
            this.O2R = () => resolve();
        });
        this.HP = new Promise((resolve,_)=>{
            this.HR = () => resolve();
        });
        this.H20P = new Promise((resolve,_)=>{
            this.H2OR = () => resolve();
        });
    }
    waitForWater(){
        return new Promise((resolve,_)=>{
            Promise.all([this.O1P,this.O2P,this.HR])
            .then(()=>{
                console.log("----We have water!----");
                setTimeout(()=>{
                    this.H2OR();
                    this.initResolvers();
                    resolve();
                },1000);
            });
        });
    }
    oxygenRecieved(index){
        (index===1?this.O1R:this.O2R)();
        return this.H2OP;
    }
    hydrogenRecieved(){
        this.HR();
        return this.H2OP;
    }
    get hydrogen() {
        return this.HP;
    }
    get oxygen(index){
        return index===1?this.O1P:this.O2P;
    }
}
var heronsFountain = null;

const MESSAGE_KEYS = {
    O1C : "oxygen1Created",
    O2C : "oxgen2Createad",
    HC  : "hydrogenCreated"
};

const MESSAGE_MAP = {
    [MESSAGE_KEYS.O1C] : heronsFountain.oxygenRecieved(1),
    [MESSAGE_KEYS.O2C] : heronsFountain.oxygenRecieved(2),
    [MESSAGE_KEYS.HR] : heronsFountain.hydrogenRecieved()
};

function perpetualCreation(atom,msg_key){
    function r(){
        console.log(`${atom}-created!`);
        return mpu.sendW2W(msg_key,3);
    }
    return r();
}

if(cluster.isMaster){
    for(i=0;i<=3;i++) cluster.fork();
    mpu.init({MESSAGE_MAP});
}
else{
    switch(cluster.worker.id){
        case 0: ; perpetualCreation("Oxygen",MESSAGE_KEYS.O1C); break;
        case 1: ; perpetualCreation("Oxygen",MESSAGE_KEYS.O2C); break;
        case 2: ; perpetualCreation("Hydrogen",MESSAGE_KEYS.HC); break;
        case 3: 
            heronsFountain = new WaterScrew(); 
            heronsFountain.waitForWater();
            break;
        default: console.log("Unexpected child! :p")
    }
}