const axios = require('axios');
const persistentStore = require("./store")
const { BrowserWindow } = require('electron')
var moment = require('moment');

class SyncManager {
    constructor(intervalMs, syncUrls, accountId){
        this.intervalMs = intervalMs || 120000;
        this.syncUrls = syncUrls || ["https://devjam-lab.azurewebsites.net/receive"]
        this.lastFailedUrl = "" // the sync url that failed recently
        this.accountId = accountId || "_guest";
        // this.maxSyncThresholdMs = 1000*60*12
        this.maxSyncThresholdMs = 1000*60*10
    }
    static getInstance(intervalMs, syncUrls, accountId){
        const a = new SyncManager(intervalMs, syncUrls, accountId);
        a._sync();
        console.log("Sync Manager started");
        return a;
    }  
    
    setSyncUrls(urls){
        this.syncUrls = urls;
    }

    setAccountId(accountId){
        this.accountId = accountId;
    }

    async _sync(){
        let that = this;
        try{
            const eventsForSync = persistentStore.eventsForSync();            
            console.log(`SyncManager: ${this.syncUrls} ${this.accountId}`);
            if(eventsForSync.length==0){
                setTimeout(this._sync.bind(this),this.intervalMs);
                BrowserWindow.fromId(1).webContents.send('listener_eventsSync', {sync: true});  
                console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")} Sync up to date. No new events.`);
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

            urlCandidate += `/${this.accountId}`

            console.log(`Going to sync with ${urlCandidate}`);

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
    
            console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")} Syncing #${eventsForSync.length} events with min=${moment(minCt).format("YYYY-MM-DD HH:mm:ss")} and max=${moment(maxCt).format("YYYY-MM-DD HH:mm:ss")} completed.`);
    
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