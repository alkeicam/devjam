const axios = require('axios');
const persistentStore = require("./store")
const { BrowserWindow } = require('electron')

class SyncManager {
    constructor(intervalMs, syncUrls){
        this.intervalMs = intervalMs || 120000;
        this.syncUrls = syncUrls || ["https://devjam-lab.azurewebsites.net/receive/__demo"]
        this.lastFailedUrl = "" // the sync url that failed recently
        // this.maxSyncThresholdMs = 1000*60*12
        this.maxSyncThresholdMs = 1000*60*10
    }
    static getInstance(intervalMs, syncUrls){
        const a = new SyncManager(intervalMs, syncUrls);
        a._sync();
        console.log("Sync Manager started");
        return a;
    }    

    async _sync(){
        let that = this;
        try{
            const eventsForSync = persistentStore.eventsForSync();            
        
            if(eventsForSync.length==0){
                setTimeout(this._sync.bind(this),this.intervalMs);
                BrowserWindow.fromId(1).webContents.send('listener_eventsSync', {sync: true});  
                console.log(`${Date.now()} Sync up to date. No new events.`);
                return;
            }
            

            // max creation timestamp in the events array
            const maxCt = eventsForSync.reduce((accumulator, current)=>{
                return Math.max(accumulator, current.ct);
            },-1);
    
            const minCt = eventsForSync.reduce((accumulator, current)=>{
                return Math.min(accumulator, current.ct);
            },Number.MAX_SAFE_INTEGER);

            if(Date.now()-minCt>=this.maxSyncThresholdMs)
                BrowserWindow.fromId(1).webContents.send('listener_eventsSync', {sync: false});  
    
            // console.log(`${Date.now()} Syncing #${eventsForSync.length} events with mixCt=${minCt} and maxCt=${maxCt} ... `);
    
            // get first url that did not fail
            let urlCandidate = this.syncUrls.find((item)=>{return item != this.lastFailedUrl});
            if(!urlCandidate){
                // none non failed found, so try with the first one
                urlCandidate = this.syncUrls[0]
            }

            const request = {
                version: "1",
                events: eventsForSync
            }
            
            const response = await axios.post(urlCandidate,request).catch((error)=>{
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    // console.log(error.response.data);
                    // console.log(error.response.status);
                    // console.log(error.response.headers);
                    this.lastFailedUrl = urlCandidate;
                    throw new Error(`Failed to sync ${urlCandidate} due to http status ${error.response.status}`)
                  } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser 
                    // and an instance of http.ClientRequest in node.js
                    // console.log(error.request);
                    this.lastFailedUrl = urlCandidate;
                    throw new Error(`Failed to sync ${urlCandidate} - unable to connect`)                
                  } else {
                    // Something happened in setting up the request that triggered an Error
                    this.lastFailedUrl = urlCandidate;
                    throw error;
                  }
            });
    
            console.log(`${Date.now()} Syncing #${eventsForSync.length} events with mixCt=${minCt} and maxCt=${maxCt} completed.`);
    
            persistentStore.eventsMarkSync(eventsForSync);
            BrowserWindow.fromId(1).webContents.send('listener_eventsSync', {
                sync: true,
                message: `Up to date`
            });  
        }
        catch(e){     
            BrowserWindow.fromId(1).webContents.send('listener_eventsSync', {sync: false});         
            console.error(e);
        }
        
        setTimeout(this._sync.bind(this),this.intervalMs);
                        
    }
    
}

module.exports = SyncManager