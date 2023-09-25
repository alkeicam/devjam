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
 * @property {GitEventEntropyScore} e - git event entropy
 * @property {number} lst timestamp of the sync
 */

/**
 * Project data
 * @typedef {Object} Project
 * @property {string} id - project id
 * @property {string} name - project name 
 */

/**
 * Sponsors data
 * @typedef {Object} Account
 * @property {string} id - sponsor account id
 * @property {string} name - sponsor account name
 * @property {Project} project - sponsor account id
 */

const Store = require('electron-store');


class PersistentStore{
    constructor(){
        // 7 days
        this.expiryMs = 1000*60*60*24*7
        // 31 days+31 buffer
        this.expiry31Ms = 1000*60*60*24*(31+31)

        // 6 months
        this.expiry186Ms = 1000*60*60*24*(6*31)

        this.store = new Store();
    }

    static getInstance(){
        const store = new PersistentStore();
        store._setup();
        store._expiry();
        return store;
    }

    _setup(){
        if(!this.store.get("events"))
            this.store.set("events",[]);
    }

    events(){
        return this.store.get("events");
    }

    addEvent(item){        
        item.ttl = Date.now()+this.expiry186Ms;
        const items = this.store.get("events");
        items.unshift(item);
        this.store.set("events",items);
        this._expiry(); 
    }

    /**
     * Returns items that are not synced, also makes sure that protected data is cleaned before syncing
     * @returns {GitEvent[]}
     */
    eventsForSync(){                
        const items = this.store.get("events");
        const itemsCopy = JSON.parse(JSON.stringify(items));

        //GitEvent
        return itemsCopy.filter((item)=>{
            // get events that do not have sync time set
            return !item.lst 
        }).map((item)=>{
            // clear diff details
            delete item.diff
            // clear gitlog
            delete item.gitlog

            // remove also technical fields
            delete item.ttl
            delete item.lst

            return item;
        })
    }

    _getCommonObjectsByProperty(array1, array2, property) {
        return array1.filter(item1 => array2.some(item2 => item2[property] === item1[property]));
    }
    /**
     * Marks provided items as synced
     * @param {*} events items to be marked as sync
     */
    eventsMarkSync(events){
        const syncTimeMs = Date.now();
        const items = this.store.get("events");
        var result = this._getCommonObjectsByProperty(items, events, "id");
        result.forEach((item)=>{
            item.lst = syncTimeMs;
        })
        this.store.set("events",items);
    }

    _expiry(){
        const old = this.store.get("events");
        const news = old.filter((item)=>{
            // console.log("Item", item, Date.now());
            return item.ttl>=Date.now()
        });
        this.store.set("events", news);
    }

    addPreferences(email, syncUrls, accountId, syncIntervalMs){
        let preferences = this.preferences()||{};
        if(typeof preferences !== 'object')
            preferences = {}
        // let preferences = {};
        preferences.email = email;
        preferences.syncUrls = syncUrls; 
        preferences.accountId = accountId;  
        preferences.syncIntervalMs = syncIntervalMs;         
        this.store.set("preferences",preferences);
    }
    addPreferencesEmail(email){
        const preferences = this.preferences()||{};
        preferences.email = email;
        this.store.set("preferences",preferences);
    }

    resetPreferences(){
        this.store.delete("preferences");
    }

    /**
     * 
     * @param {Account} account 
     */
    addAccount(account){
        let accounts = this.store.get("accounts")||[]
        // remove the account if exists
        accounts = accounts.filter((item)=>{return (item&&item.id != account.id)||(item&&item.id == account.id&&item.project&&item.project.id!=account.project.id)});

        accounts.push(account);

        this.store.set("accounts",accounts);
    }
    /**
     * 
     * @returns {Account[]}
     */
    accounts(){
        let accounts = this.store.get("accounts")||[]
        return accounts;
    }

    resetAccounts(){
        this.store.delete("accounts");
    }

    /**
     * 
     * @returns {*} preferences
     */
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