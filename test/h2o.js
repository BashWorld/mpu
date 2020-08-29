const cluster = require('cluster');
const { async } = require('q');
const children = 3;

const workerEnv = {
    3: function(){
        return {
            env : {
                hCount: 0,
                oCount: 0,
                h2oCount: 0,
            },
            functions : {
                increamentHCounter :  function() { return ++this.env.hCount},
                increamentOCounter :  function() { return ++this.env.oCount},
                waterCreated : function() {
                    if(this.env.hCount == 2 && this.env.oCount == 1) {
                        return "RESOLVE";
                    }
                    return "WAIT";
                } 
            }
        };
    }
};

const clusterEnv = {
    localCount : 0,
    type : "",
    0 : function createHydrogen(){
        function rec(){
            type = "H-atom";
            console.log(`PID ${process.pid} created H-atom [#{this.localCount++}]`);
            workerEnv.functions.increamentHCounter()
            .then(workerEnv.functions.waterCreated).then(rec);
        }
        rec();
    },
    1 : this[0],
    2 : function createOxygen(){
        type = "O-atom";
        console.log(`PID ${process.pid} created O-atom [#{this.localCount++}]`);
        callAgain = this[2];
        workerEnv.functions.increamentHCounter()
        .then(workerEnv.functions.waterCreated).then(callAgain);
    },
    3 : function createWater(){
        type = "H2O-molecule";
        console.log(`PID ${process.pid} created H2O-molecule [#{count++}]`);
        callAgain = this[3];
        workerEnv.functions.increamentHCounter()
        .then(workerEnv.functions.waterCreated).then(callAgain);
    }
};

if(cluster.isMaster){

}else{
    let functionToExecute = functionMap[cluster.worker.id];
    (async function(){
        while(true){

        }
    })();
}

process.on("SIGINT", function(){
    console.log(`Exiting. Total ${type} create := ${count}`);
    process.exit();
});