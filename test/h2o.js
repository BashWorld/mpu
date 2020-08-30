const cluster = require('cluster');
const mpu = require("../index");

function recurse(f){
    var pr = Promise.resolve();
    while(true){
        pr=pr.then(f);
    }
}

let WaterScrew = {
    initResolvers : function(){
        this.O1R = new Promise((resolve,_)=>{
            this.O1R = resolve;
        });
        this.O2P = new Promise((resolve,_)=>{
            this.O2R = resolve;
        });
        this.HP = new Promise((resolve,_)=>{
            this.HR = resolve;
        });
        this.H20P = new Promise((resolve,_)=>{
            this.H2OR = resolve;
        });
    },
    waitForWater:function(){
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
    },
    oxygenRecieved:function(index){
        let f=(index===1?this.O1R:this.O2R);
        return ()=>{
            console.log("OK! O",index);
            f();
            this.H2OP;
        };
    },
    hydrogenRecieved:function(){
        console.log("OK! H");
        this.HR();
        return this.H2OP;
    }
}
WaterScrew.initResolvers();
const MESSAGE_KEYS = {
    O1C : "oxygen1Created",
    O2C : "oxgen2Createad",
    HC  : "hydrogenCreated"
};

const MESSAGE_MAP = {
    [MESSAGE_KEYS.O1C] : WaterScrew.oxygenRecieved(1),
    [MESSAGE_KEYS.O2C] : WaterScrew.oxygenRecieved(2),
    [MESSAGE_KEYS.HR]  : WaterScrew.hydrogenRecieved()
};

function perpetualCreation(atom,msg_key){
    function r(){
        console.log(`${atom}-created!`);
        return mpu.sendToSibling({siblingId:4,message:msg_key});
    }
    return r();
}

if(cluster.isMaster){
    for(i=0;i<=3;i++) cluster.fork();
    mpu.init({COMMON_MAP:MESSAGE_MAP, FAMILY_SIZE:4});
}
else{
    switch(cluster.worker.id){
        case 1: ; perpetualCreation("Oxygen",MESSAGE_KEYS.O1C); break;
        case 2: ; perpetualCreation("Oxygen",MESSAGE_KEYS.O2C); break;
        case 3: ; perpetualCreation("Hydrogen",MESSAGE_KEYS.HC); break;
        case 4: 
            WaterScrew.waitForWater();
            break;
        default: console.log("Unexpected child! :p")
    }
}