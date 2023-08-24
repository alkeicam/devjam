import axios from 'axios';
const persistentStore = require("./store")

class SyncManager {
    constructor(intervalMs, syncUrls){
        this.intervalMs = intervalMs || 120000;
        this.syncUrls = syncUrls || ["https://some.sync.url"]
        this.syncStatus = {
            lastSyncMs: -1,            
        }
        this.lastFailedUrl = ""
    }
    static getInstance(intervalMs, syncUrls){
        const a = new SyncManager(intervalMs, syncUrls);
        a._sync();
        return a;
    }    

    async _sync(){
        const eventsForSync = persistentStore.eventsForSync();
        
        // max creation timestamp in the events array
        const maxCt = eventsForSync.reduce((accumulator, current)=>{
            return Math.max(accumulator, current.ct);
        },-1);

        const minCt = eventsForSync.reduce((accumulator, current)=>{
            return Math.min(accumulator, current.ct);
        },Number.MAX_SAFE_INTEGER);

        console.log(`${Date.now()} Syncing with mixCt=${minCt} and maxCt=${maxCt} ... `);

        // get first url that did not fail
        let urlCandidate = this.syncUrls.find((item)=>{return item != this.lastFailedUrl});
        if(!urlCandidate){
            // none non failed found, so try with the first one
            urlCandidate = this.syncUrls[0]
        }
        
        const response = await axios.post(this.urlCandidate,eventsForSync).catch((error)=>{
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                this.lastFailedUrl = this.urlCandidate;
                throw new Error(`Failed to sync due to http status ${error.response.status}`)
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser 
                // and an instance of http.ClientRequest in node.js
                console.log(error.request);
                this.lastFailedUrl = this.urlCandidate;
                throw new Error(`Failed to sync due to connection ${error.request}`)                
              } else {
                // Something happened in setting up the request that triggered an Error
                this.lastFailedUrl = this.urlCandidate;
                throw error;
              }
        });

        persistentStore.eventsMarkSync(eventsForSync);

        setTimeout(this.sync.bind(this),this.intervalMs);
    }
    
}

module.exports = SyncManager