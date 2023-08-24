/**
 * Person code action event
 * @typedef {Object} GitEvent
 * @property {number} ct - creation timestamp
 * @property {number} s - score
 * @property {string} gitlog - result of git log --stat -1 HEAD in base64.
 * @property {string} diff - result of git show.
 * @property {string} oper - one of "commit" and "push"
 * @property {string} remote - result of git config --get remote.origin.url (may be empty when only local repo)
 * @property {GitLogDecoded} decoded - decoded git log data
 * @property {GitEventEntropyScore} entropy - git event entropy
 * @property {number} e 
 * 
 */

const Store = require('electron-store');


class PersistentStore{
    constructor(){
        // 7 days
        this.expiryMs = 1000*60*60*24*7
        // 31 days+31 buffer
        this.expiry31Ms = 1000*60*60*24*(31+31)
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

    events(){
        return this.store.get("last31");
    }

    addEvent(item){        
        item.ttl = Date.now()+this.expiry31Ms;
        const items = this.store.get("last31");
        items.unshift(item);
        this.store.set("last31",items);
        this._expiry(); 
    }

    /**
     * 
     * @returns {GitEvent[]}
     */
    eventsForSync(){                
        const items = this.store.get("last31");
        //GitEvent
        return items.filter((item)=>{
            // get events that do not have sync time set
            return !item.lst 
        })
    }

    _getCommonObjectsByProperty(array1, array2, property) {
        return array1.filter(item1 => array2.some(item2 => item2[property] === item1[property]));
    }

    eventsMarkSync(events){
        const syncTimeMs = Date.now();
        const items = this.store.get("last31");
        var result = this._getCommonObjectsByProperty(items, events, "ct");
        result.forEach((item)=>{
            item.lst = syncTimeMs;
        })
        this.store.set("last31",items);
    }

    _expiry(){
        const old = this.store.get("last31");
        const news = old.filter((item)=>{
            // console.log("Item", item, Date.now());
            return item.ttl>=Date.now()
        });
        this.store.set("last31", news);
    }

    addPreferences(preferenceItem){
        this.store.set("preferences",preferenceItem);
    }
    preferences(){
        return this.store.get("preferences");
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