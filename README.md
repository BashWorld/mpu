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
let cluster = require('cluster');
let mpu = require('mp-unit');
let totalWorkers = os.cpus().length;

let FUN_KEY = "CHECK";
let MSG_MAP = {};
let fun = function (){
    console.log("FROM WORKER "+cluster.worker.id+" := "+process.pid);
    return Promise.resolve();
};
MSG_MAP[FUN_KEY] = fun;

let params = {
    WORKERS : totalWorkers,
    MSG_MAP : MSG_MAP,
    TIMEOUT : 10
};

if(cluster.isMaster){
    for(let i = 0;i<totalWorkers;++i){
        cluster.fork();
    }
    mpu.init(params);
}
else if(cluster.isWorker){
    mpu.init(params);
    mpu.sendW2WS(FUN_KEY)
        .then(function (){
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
Thus, working as though only a single process called the `sendW2WS` (Worker-To-Workers) function.

### Updates
Added sendW2M (Worker-to-Master) function
(future update will add a flag to make sure that only a single call is executed,
if called from all the workers
)
//what if worker dies and we send message