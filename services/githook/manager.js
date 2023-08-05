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
 * @property {string} commit - commit line with commit hash
 * @property {Author} author - author data
 * @property {string} date - date line
 * @property {string} message - change message
 * @property {string} changes - changes lines
 * @property {ChangeSummary} changeSummary - summary of changes
 */

/**
 * Person code action event
 * @typedef {Object} GitEvent
 * @property {number} ct - creation timestamp
 * @property {number} s - score
 * @property {string} gitlog - result of git log --stat -1 HEAD.
 * @property {string} oper - one of "commit" and "push"
 * @property {string} remote - result of git config --get remote.origin.url (may be empty when only local repo)
 * @property {GitLogDecoded} decoded - decoded git log data
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

//TODO - remove
const { BrowserWindow } = require('electron')
const persistentStore = require("../../logic/store")
var moment = require('moment');
const {Stats} = require("../../logic/stats");


class Manager {
    constructor(api){
        this.api = api;  
        this.stats = new Stats();      
    }

    /**
     * Parses original git log message
     * @param {*} message raw git log command results
     * @returns {GitLogDecoded} decoded git log data
     */
    _paseGitLog(message){
        const lines = message.split(/\r?\n/);
        console.log(lines);
        const endOfCommitMessage = lines.indexOf("",4);

        const userMessage = lines.slice(4,endOfCommitMessage).join("");

        
        // either first uppercase word ending with number or in brackets    
        const ticketFromUppercase = userMessage.match(/([A-Z]+\-\d+)/g)?userMessage.match(/([A-Z]+\-\d+)/g)[0]:undefined;
        // either word in square brackets
        const ticketFromSquareBrackets = userMessage.match(/(\[.+\])/ig)?userMessage.match(/(\[.+\])/ig)[0].replace(/[\[\]]/ig,""):undefined;

        const ticket = ticketFromUppercase || ticketFromSquareBrackets;
        


        const data = {                     
            ticket: ticket,
            commit: lines[0],
            author: {
                name: lines[1].replace(/Author\:\s+/ig,"").replace(/\<\S+\>.*/ig,""),
                email: lines[1].replace(/.+\</ig,"").replace(/\>.?/ig,"")
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
        return data;

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
            score+=100
            return score;
        }
        
        // and point for each insertion, deletion
        score += item.decoded.changeSummary.inserts;
        score += item.decoded.changeSummary.deletions;

        return score;
    }

    /**
     * Parses and decodes raw commit message from client endpoint
     * @param {*} body - request body with json from client endpoint
     * @returns {GitEvent} git event data
     */
    _decode(body){
        let buff = Buffer.from(body.gitlog, 'base64');  
        let message = buff.toString('utf-8');        

        const result = JSON.parse(JSON.stringify(body));
        result.gitlog = message;

        const decoded = this._paseGitLog(message);
        result.decoded = decoded;
        
        result.ct = moment().valueOf();
        result.s = this._score(result);

        const myURL = new URL(result.remote);
        const passInURL = myURL.password;
        const userInURL = myURL.username;
        
        if(passInURL) result.remote = result.remote.replace(passInURL,"");
        if(userInURL) result.remote = result.remote.replace(userInURL,"");

        // console.log(`score is ${result.s}`);
        return result;        
    }

    /**
     * Git commit hook calls this method via REST JSON call
     * @param {*} auth 
     * @param {*} params 
     * @param {*} body 
     */
    async change(auth, params, body){        
        const gitEvent = this._decode(body);        
        persistentStore.addEvent(gitEvent);
        const dailyStats = await this.stats.today();
        
        // here we notify the interface, that new change has arrived and
        // it needs to update the stats
        BrowserWindow.fromId(1).webContents.send('listener_commitReceived', dailyStats);        
    }





    async effort(auth, params, body){
        const events = persistentStore.events();

        //     count: items.length,
                //     items: items ||[] 
        return events;                
    }

}

module.exports = {Manager};