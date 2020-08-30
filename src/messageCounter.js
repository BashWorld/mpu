class MessageCounter {
    constructor(numOfWorkers){
        this.NUM_WORKERS = numOfWorkers;
        this.COUNTERS    = new Map();
    }
    addCounter(KEY){
        if(KEY in this.COUNTERS) throw new Error("Key Exists!");
        else this.COUNTERS[KEY]=0;
    }
    incCounter(KEY){
        if(KEY in this.COUNTERS) throw new Error("Key Exists!");
        else this.COUNTERS[KEY]++;
    }
}