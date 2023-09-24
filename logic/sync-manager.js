const axios = require('axios');
const persistentStore = require("./store")
const { BrowserWindow } = require('electron')
var moment = require('moment');
const CONSTANTS = require("./constants");
const log = require('electron-log');


class SyncManager {
    constructor(intervalMs, baseUrls){
        this.intervalMs = intervalMs || 120000;
        
        this.baseUrls = baseUrls || CONSTANTS.API.BASE_URLS
        this.lastFailedUrl = "" // the sync url that failed recently                
        
    }
    static getInstance(intervalMs, baseUrls){
        const a = new SyncManager(intervalMs, baseUrls);
        a._sync();
        log.info("Sync Manager started");
        return a;
    }  
    
    setBaseUrls(urls){
        this.baseUrls = urls;
    }

    setIntervalMs(intervalMs){
        this.intervalMs = intervalMs;
    }

    async _sync(){
        let that = this;
        try{
            const eventsForSync = persistentStore.eventsForSync();            
            log.info(`SyncManager: ${this.baseUrls}${CONSTANTS.SYNC.PATH} ${this.intervalMs}`);
            if(eventsForSync.length==0){
                setTimeout(this._sync.bind(this),this.intervalMs);
                BrowserWindow.fromId(1).webContents.send('listener_eventsSync', {sync: true});  
                log.info(`${moment().format("YYYY-MM-DD HH:mm:ss")} Sync up to date. No new events.`);
                return;
            }
            

            // max creation timestamp in the events array
            const maxCt = eventsForSync.reduce((accumulator, current)=>{
                return Math.max(accumulator, current.ct);
            },-1);
    
            const minCt = eventsForSync.reduce((accumulator, current)=>{
                return Math.min(accumulator, current.ct);
            },Number.MAX_SAFE_INTEGER);
                
            // get first url that did not fail
            let urlCandidate = this.baseUrls.find((item)=>{return item != this.lastFailedUrl});
            if(!urlCandidate){
                // none non failed found, so try with the first one
                urlCandidate = this.baseUrls[0]
            }

            // urlCandidate += `/${this.accountId}`

            



            

            // group by accounts
            const organizedByAccounts = eventsForSync.reduce((map, e) => ({
                ...map,
                [e.account||this.accountId]: [...(map[e.account] ?? []), e]
              }), {});
                      
            for (const account in organizedByAccounts){
                const events = organizedByAccounts[account];
                let url = `${urlCandidate}${CONSTANTS.SYNC.PATH}/${account}`
                const request = {
                    version: "2",
                    events: events
                }   
                log.info(`${moment().format("YYYY-MM-DD HH:mm:ss")} Going to sync with ${url}`);     
                const response = await axios.post(url,request).catch((error)=>{
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        // console.log(error.response.data);
                        // console.log(error.response.status);
                        // console.log(error.response.headers);
                        this.lastFailedUrl = url;
                        throw new Error(`Failed to sync ${url} due to http status ${error.response.status}`)
                      } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser 
                        // and an instance of http.ClientRequest in node.js
                        // console.log(error.request);
                        this.lastFailedUrl = url;
                        throw new Error(`Failed to sync ${url} - unable to connect`)                
                      } else {
                        // Something happened in setting up the request that triggered an Error
                        this.lastFailedUrl = url;
                        throw error;
                      }
                });
            }
            

            
    
            log.info(`${moment().format("YYYY-MM-DD HH:mm:ss")} Syncing #${eventsForSync.length} events with min=${moment(minCt).format("YYYY-MM-DD HH:mm:ss")} and max=${moment(maxCt).format("YYYY-MM-DD HH:mm:ss")} completed.`);
    
            persistentStore.eventsMarkSync(eventsForSync);
            BrowserWindow.fromId(1).webContents.send('listener_eventsSync', {
                sync: true,
                message: `Up to date`
            });  
        }
        catch(e){     
            BrowserWindow.fromId(1).webContents.send('listener_eventsSync', {sync: false});         
            log.error(e);
        }
        
        setTimeout(this._sync.bind(this),this.intervalMs);
                        
    }
    
}

module.exports = SyncManager