const cluster = require('cluster');
const numOfCPUs = require('os').cpus().length;

if(cluster.isMaster){
    console.log(`Number of CPUS:=${numOfCPUs}`);
    for(let i=0;i<numOfCPUs;i++){
        cluster.fork();
    }

    for( const id in cluster.workers){
        cluster.workers[id].on('message',function(msg){
            console.log("Message 1:=",msg);
        });
        cluster.workers[id].on('message',function(msg){
            console.log("Message 2:=",msg);
        });
    }
}
else{
    process.send({fn:function(){return 1;},m:"Hey! From pid@"+process.pid});
    process.exit();
}