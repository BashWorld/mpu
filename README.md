[![](https://img.shields.io/bower/l/mi.svg?style=for-the-badge)](https://github.com/raw-ash/mpu)

Helps in passing messages within a cluster between
1) Master to worker(s)
2) Worker to other worker(s) 

### Install
`$ npm install mp-unit`

### Usage
Always call the `mp-unit.init` function for master and all worker processes. 
Make sure that the `mp-unit.init` function for the master is called after the cluster has been created.

```js
let os = require('os');
let mpu = require('mp-unit');
let cluster = require('cluster');
let totalWorkers = 3;

function logWithTabs(workerId,message){
    const tabString = '\t\t\t'.repeat(workerId-1);
    console.log(tabString+message);
}

let FUN_KEY = "CHECK";
let MSG_MAP = {
    [FUN_KEY]: (workerId) => {
        logWithTabs(workerId,`[${workerId}] In Worker ${cluster.worker.id}`);
        return Promise.resolve();
    }
};

function init(){
    mpu.init(MSG_MAP,{FAMILY_SIZE:totalWorkers});
}

if(cluster.isMaster){
    for(let i = 0;i<totalWorkers;++i){
        cluster.fork();
    }
    init();
}
else if(cluster.isWorker){
    init();
    logWithTabs(cluster.worker.id,`[${cluster.worker.id}] Start`);
    mpu.sendToSiblings({message:FUN_KEY, siblingIds:-1, value:cluster.worker.id})
        .then(function (){
            logWithTabs(cluster.worker.id,`[${cluster.worker.id}] End`);
            cluster.worker.disconnect();
        });
}
```

Every key in the `MSG_MAP` object corresponds to a promise-based function, as shown in the above example,
`FUN_KEY` is mapped to `fun`. Keys in `MSG_MAP` corresponds to the message that is being thrown
around in the cluster.

The above example shows how a single worker can ask all worker processes (including itself)
to execute a function. Even though every worker process is trying to ask all worker processes
to execute the `fun` function, `mp-unit` module makes sure that only a single call goes to all processes. 
Thus, working as though only a single process called the `sendToSiblings` (Worker-To-Workers) function.