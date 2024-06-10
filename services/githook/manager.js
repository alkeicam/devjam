/**
 * Author
 * @typedef {Object} Author
 * @property {string} name - name
 * @property {string} email - email
 */

/**
 * Summary of changes
 * @typedef {Object} ChangeSummary
 * @property {string} raw - raw changes message
 * @property {number} files - files modified
 * @property {number} inserts - inserts made
 * @property {number} deletions - deletions made
 */

/**
 * Person code action event
 * @typedef {Object} GitLogDecoded
 * @property {string} ticket - id of the ticket
 * @property {string} ticketPrefix - ticket prefix, usually this should map to external project id/code
 * @property {string} commit - commit line with commit hash
 * @property {Author} author - author data
 * @property {string} date - date line
 * @property {string} message - change message
 * @property {string} changes - changes lines
 * @property {ChangeSummary} changeSummary - summary of changes
 */

/**
 * Entropy of the git event
 * @typedef {Object} GitEventEntropyScore
 * @property {number} ec - commit line entropy
 * @property {number} em - commit message entropy
 * @property {number} et - ticket entropy
 * @property {number} er - raw message entropy
 * @property {number} ed - diff entropy
 * @property {number} e - final entropy
 */

/**
 * @typedef {Object} GitEventRaw
 * @property {number} ct - creation timestamp
 * @property {number} s - score
 * @property {string} gitlog - result of git log --stat -1 HEAD in base64.
 * @property {string} diff - result of git show.
 * @property {string} oper - one of "commit" and "push"
 * @property {string} remote - result of git config --get remote.origin.url (may be empty when only local repo)
 * @property {string} accountId - tenant/account if of the event
 */

/**
 * @typedef {Object} GitEvent
 * @property {number} ct - creation timestamp
 * @property {number} s - score
 * @property {string} gitlog - result of git log --stat -1 HEAD decoded as string
 * @property {string} diff - result of git show as string
 * @property {string} oper - one of "commit" and "push"
 * @property {string} remote - result of git config --get remote.origin.url (may be empty when only local repo)
 * @property {string} accountId - tenant/account if of the event
 */
/**
 * Person code action event
 * @typedef {Object} GitEventProcessed
 * @property {number} ct - creation timestamp
 * @property {number} s - score
 * @property {string} gitlog - result of git log --stat -1 HEAD.
 * @property {string} diff - result of git show.
 * @property {string} oper - one of "commit" and "push"
 * @property {string} remote - result of git config --get remote.origin.url (may be empty when only local repo) 
 * @property {string} accountId - tenant/account if of the event
 * @property {GitLogDecoded} decoded - decoded git log data
 * @property {GitEventEntropyScore} e - git event entropy
 * @property {number} lst timestamp of the sync (may be undefined)
 * 
 */

/**
 * Persons daily effort/achievement
 * @typedef {Object} DailyStatsProject
 * @property {string} id - project id (remote url)
 * @property {string} duration - daily work duration
 * @property {string} inserts - inserts today
 * @property {string} deletions - deletions today
 * @property {string} files - files modified today
 * @property {number} score - todays score
 * @property {number} pace - tickets per hour
 * @property {number} paceScore - score earned per hour
 * @property {number} paceScore - score earned per hour
 */

/**
 * Persons daily effort/achievement
 * @typedef {Object} DailyStatsUser
 * @property {string} id - user id (email)
 * @property {string} duration - daily work duration
 * @property {string} inserts - inserts today
 * @property {string} deletions - deletions today
 * @property {string} files - files modified today
 * @property {number} score - todays score
 * @property {number} pace - tickets per hour
 * @property {number} paceScore - score earned per hour
 * @property {DailyStatsProject} _project_ - projects that user was working on
 */

/**
 * Persons daily effort/achievement
 * @typedef {Object} DailyStatsUsers
 * @property {DailyStatsUser} _useremail_ - dynamic property (user email)
 */

/**
 * Daily effort/achievement
 * @typedef {Object} DailyStats
 * @property {number} day - day of stats (truncated to 12AM)
 * @property {DailyStatsUsers[]} users - daily stats for users
 */

const { BrowserWindow } = require('electron')
const persistentStore = require("../../logic/store")
var moment = require('moment');
const {Stats} = require("../../logic/stats");
const log = require('electron-log');


class Manager {
    constructor(api){
        this.api = api;  
        this.stats = new Stats();  
        this.persistentStore = persistentStore;    
    }

    /**
     * Git commit hook calls this method via REST JSON call. This is an entrypoint to manager processing.
     * @param {*} auth 
     * @param {*} params 
     * @param {GitEventRaw} body json containing code change metadatadas from hook
     */
    async change(auth, params, body){      

        const gitEvent = this._decode(body);  

        this.persistentStore.addEvent(gitEvent);

        await this._emitStats();
        
        log.log(`Processed ${gitEvent.remote} with entropy: ${gitEvent.e.e} and message: ${gitEvent.decoded.message}`)    
    }

    async _emitStats(){
        const dailyStats = await this.stats.today();
        
        // here we notify the interface, that new change has arrived and
        // it needs to update the stats
        // BrowserWindow.fromId(1).webContents.send('listener_commitReceived', dailyStats);  
        this._emitEvent('listener_commitReceived', dailyStats);
    }

    /* istanbul ignore next */
    _emitEvent(name, data){
        BrowserWindow.fromId(1).webContents.send(name, data);  
    }

    _parseTicket(message){
        const lines = message.split(/\r?\n/);
        // console.log(lines);
        const endOfCommitMessage = lines.indexOf("",4);

        const userMessage = lines.slice(4,endOfCommitMessage).join("");

        
        // either first uppercase word ending with number or in brackets    
        const ticketFromUppercase = userMessage.match(/([A-Z0-9_]+\-\d+)/g)?userMessage.match(/([A-Z0-9_]+\-\d+)/g)[0]:undefined;
        // either word in square brackets
        const ticketFromSquareBrackets = userMessage.match(/(\[.+\])/ig)?userMessage.match(/(\[.+\])/ig)[0].replace(/[\[\]]/ig,""):undefined;

        const ticket = ticketFromUppercase || ticketFromSquareBrackets;
        // assume that in general ticket has a form of a characters followed by a "-" sign followed by a number
        // so lets extract ticket prefix, which can be further mapped onto delivery project
        const ticketPrefix = ticket&&ticket.indexOf("-")!=-1?ticket.split("-")[0]:undefined;


        return {
            ticket: ticket,
            ticketPrefix: ticketPrefix
        }
    }

    

    /**
     * calculates effor score
     * @param {GitEvent} item 
     * @returns {number} calculated score
     */
    _score(item){
        let score = 0; // initialize score

        // you get 100 points for each push
        if(item.oper == "push"){
            score+=13
            return score;
        }
        let insertDelScore = 0
        // and point for each insertion, deletion
        insertDelScore += item.decoded.changeSummary.inserts;
        insertDelScore += item.decoded.changeSummary.deletions;

        score = item.e.e*insertDelScore/100

        score = parseFloat(score.toFixed(1))

        return score;
    }

    /**
     * Updates gitevent with entropy score
     * @param {GitEvent} gitEvent 
     * 
     */
    _calculateEntropyScope(gitEvent){
        /*
        * @typedef {Object} GitEventEntropyScore
        * @property {number} ec - commit line entropy
        * @property {number} em - commit message entropy
        * @property {number} et - ticket entropy
        * @property {number} er - raw message entropy
        * @property {number} ed - diff entropy
        * @property {number} e - final entropy
        */

        const entropy = {
            ec: this._entropy(gitEvent.decoded.commit||0),
            em: this._entropy(gitEvent.decoded.message||0),
            et: this._entropy(gitEvent.decoded.ticket||0),
            er: this._entropy(gitEvent.gitlog||0),
            ed: this._entropy(gitEvent.diff||0)            
        }

        entropy.e = entropy.ec+entropy.em+entropy.et+entropy.er+entropy.ed;

        gitEvent.e = entropy;

    }

    _entropy(str){
        const len = str.length
 
        // Build a frequency map from the string.
        const frequencies = Array.from(str)
          .reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq, {})
       
        // Sum the frequency of each character.
        const sum = Object.values(frequencies)
          .reduce((sum, f) => sum - f/len * Math.log2(f/len), 0)        
        


        return parseFloat(sum.toFixed(3));
    }

    /**
     * Decodes event gitlog data (which is a result of "git log --stat -1 HEAD | base64" operation)
     * @param {GitEventRaw} event 
     * @returns {GitEvent} event with updated gitlog field
     */
    _decodeGitMessage(event){
        const result = event;
        let buff = Buffer.from(event.gitlog, 'base64');  
        let message = buff.toString('utf-8');
        result.gitlog = message;

        return result;
    }

    /**
     * Decodes event diff field (when provided - which is a result of "git show --unified | base64")
     * @param {GitEventRaw} event 
     * @returns {GitEvent} event with updated diff field
     */
    _decodeGitDiff(event){
        const result = event;
        if(event.diff){
            let diffBuff = Buffer.from(event.diff, 'base64');  
            let diff = diffBuff.toString('utf-8');
            result.diff = diff;
        }
        return result;
    }

    /**
     * Decodes git log data into json object
     * @param {GitEvent} event git event
     * @returns {GitLogDecoded} event with decoded git log data
     */
    _decodeGitLog(event){
        const message = event.gitlog;
        const lines = message.split(/\r?\n/);
        // console.log(lines);
        const endOfCommitMessage = lines.indexOf("",4);
        const userMessage = lines.slice(4,endOfCommitMessage).map(item=>item.trim()).join("");
        const {ticket, ticketPrefix} = this._parseTicket(message);        
        const data = {                     
            ticket: ticket,
            ticketPrefix: ticketPrefix,
            commit: lines[0],
            author: {
                name: lines[1].replace(/Author\:\s+/ig,"").replace(/\<\S+\>.*/ig,"").trim(),
                email: lines[1].replace(/.+\</ig,"").replace(/\>.?/ig,"").trim()
            },
            date: lines[2],
            message: userMessage,
            changes: lines.slice(endOfCommitMessage+1, lines.length-2),
            changeSummary: {
                raw: lines[lines.length-2],
                files: parseInt(lines[lines.length-2].match(/(\d+ file)/ig)?lines[lines.length-2].match(/(\d+ file)/ig)[0].match(/(\d+)/ig)[0]:0),
                inserts: parseInt(lines[lines.length-2].match(/(\d+ insertion)/ig)?lines[lines.length-2].match(/(\d+ insertion)/ig)[0].match(/(\d+)/ig)[0]:0),
                deletions: parseInt(lines[lines.length-2].match(/(\d+ deletion)/ig)?lines[lines.length-2].match(/(\d+ deletion)/ig)[0].match(/(\d+)/ig)[0]:0)
            }
        }
        
        event.decoded = data;
        return event;
    }

    _decodeRemote(event){
        try{            
            const myURL = new URL(event.remote);
            const passInURL = myURL.password;
            const userInURL = myURL.username;
            
            if(passInURL) event.remote = event.remote.replace(passInURL,"");
            if(userInURL) event.remote = event.remote.replace(userInURL,"");
        }
        catch(e){
            if(!event.remote){
                throw new Error("Remote parameter missing");
            }
            // for local git repository which fails new URL do nothing            
        }


        return event;
    }

    /**
     * Parses and decodes raw commit message from client endpoint
     * @param {GitEventRaw} body - request body with json from client endpoint
     * @returns {GitEventProcessed} processed git event data
     */
    _decode(body){
        let result = JSON.parse(JSON.stringify(body)); 
        result.id = `${Math.random().toString(36).substring(2, 24)}`;                        
        result.ct = moment().valueOf();

        result = this._decodeGitMessage(result);                        
        result = this._decodeGitDiff(result);
        result = this._decodeGitLog(result);  
        result = this._decodeRemote(result);

        
        this._calculateEntropyScope(result);
        result.s = this._score(result);
    
        return result;        
    }

    /**
     * @deprecated seems this operation is no more used, to be removed in future versions of manager
     * @param {*} auth 
     * @param {*} params 
     * @param {*} body 
     * @returns 
     */
    async effort(auth, params, body){
        const events = persistentStore.events();
        return events;                
    }

}

module.exports = {Manager};