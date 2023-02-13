/**
 * Recently open file item
 * @typedef {Object} RecentItem
 * @property {string} label - label/name of the file.
 * @property {string} fullPath - full absolute path to file
 * @property {number} ttl - time when this recent expires
 */

const Store = require('electron-store');


class PersistentStore{
    constructor(){
        // 7 days
        this.expiryMs = 1000*60*60*24*7
        // 31 days
        this.expiry31Ms = 1000*60*60*24*31
        this.store = new Store();
    }

    static getInstance(){
        const store = new PersistentStore();
        store._setup();
        store._expiry();
        return store;
    }

    _setup(){
        if(!this.store.get("last31"))
            this.store.set("last31",[]);
    }

    addEvent(item){        
        item.ttl = Date.now()+this.expiry31Ms;
        const items = this.store.get("last31");
        items.unshift(item);
        this.store.set("last31",items);
        this._expiry(); 
    }

    _expiry(){
        const old = this.store.get("last31");
        const news = old.filter((item)=>{
            // console.log("Item", item, Date.now());
            return item.ttl>=Date.now()
        });
        this.store.set("last31", news);
    }

    // /**
    //  * 
    //  * @param {RecentItem} recent 
    //  */
    // addRecent(recent){
        
    //     recent.ttl = Date.now()+this.expiryMs;
    //     const recents = this.store.get("recents")
    //     const newRecents = recents.filter((item)=>item.fullPath!=recent.fullPath);
    //     newRecents.unshift(recent);
    //     this.store.set("recents",newRecents);
    //     this._expiry();        
    // }

    // /**
    //  * 
    //  * @returns {RecentItem[]}
    //  */
    // recents(){
    //     return this.store.get("recents");
    // }

    // purge(){
    //     this._setupRecents();
    // }
    // _expiry(){
    //     const oldRecents = this.store.get("recents");
    //     const newRecents = oldRecents.filter((item)=>{
    //         console.log("Item", item, Date.now());
    //         return item.ttl>=Date.now()
    //     });
    //     this.store.set("recents", newRecents);
    // }

    // _setupRecents(){
    //     this.store.set("recents",[]);
    // }
}

module.exports = PersistentStore.getInstance();