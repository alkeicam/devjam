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

//TODO - remove
const { BrowserWindow } = require('electron')
const persistentStore = require("../../logic/store")
var moment = require('moment');

class Manager {
    constructor(api){
        this.api = api;        
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
                email: lines[1].replace(/.+\</ig,"").replace(/\>.+/ig,"")
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
            return;
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
        return result;        
    }

    async change(auth, params, body){        
        const gitEvent = this._decode(body);        
        persistentStore.addEvent(gitEvent);
        const dailyStats = await this._updateDayStats();
        // console.log(dailyStats);
        BrowserWindow.fromId(1).webContents.send('listener_commitReceived', gitEvent);
        // console.log(`Commit received`, body);
    }

    // async push(auth, params, body){
    //     const gitEvent = this._decode(body);        
    //     persistentStore.addEvent(gitEvent);
    //     BrowserWindow.fromId(1).webContents.send('listener_commitReceived', gitEvent);
    //     // console.log(`Commit received`, body);
    // }

    async _userStartOfWork(email){
        // default start at 8 AM
        const startOfWork = moment().startOf("day").add(8,"hours");
        return startOfWork.valueOf();
    }

    async _updateDayStats(){
        const startOfToday = moment().startOf("day").valueOf();
        
        const allEvents = persistentStore.events();
        // console.log(allEvents);
        // get all events from today
        const todayEvents = allEvents.filter((item)=>{return item.ct>=startOfToday});
        console.log(todayEvents);
        const events = todayEvents.map((item)=>{
            return  {
                project: item.remote,
                task: item.decoded.ticket,
                time: item.ct,
                stats: item.decoded.changeSummary,
                score: item.s,
                name: item.decoded.author.name,
                email: item.decoded.author.email,
            }            
        })

        console.log(events);
        // sort by date asc
        events.sort((a, b)=>{
            return a.ct-b.ct;
        })

        console.log(events);
        let users = [];

        events.forEach((item)=>{
            users.push(item.email);
        })


        // unique users
        users = [...new Set(users)];
        console.log(users);

        const result = {
            day: startOfToday,            
            users: {}
        }
        
        users.forEach(async (email)=>{            
             let time = await this._userStartOfWork(email);

            events.filter((item)=>item.email == email).forEach((item)=>{
                console.log(`Processing ${JSON.stringify(item)} for user ${email}`);
                // we get events for each of the users, events are time ordered
                const duration = Math.max(item.time-time,0);
                console.log(`Duration ${duration} from ${item.time} ${time}`);
                time = item.time;            
                const userData = result.users[item.email] || {
                    id: item.email,
                    duration: 0,
                    inserts: 0,
                    deletions: 0,
                    files: 0,
                    score: 0,
                    pace: 0,
                    paceScore: 0
                }
                const userProject = userData[item.project] || {
                    id: item.project,
                    duration: 0,
                    inserts: 0,
                    deletions: 0,
                    files: 0,
                    score: 0,
                    pace: 0,
                    paceScore: 0
                }
                const userTask = userProject[item.task] || {
                    id: item.task,
                    duration: 0,
                    inserts: 0,
                    deletions: 0,
                    files: 0,
                    score: 0,
                    pace: 0,
                    paceScore: 0
                }

                userTask.duration += duration;
                userTask.inserts += item.stats.inserts;
                userTask.deletions += item.stats.deletions;
                userTask.files += item.stats.files;
                userTask.score += item.score;
                userTask.pace = 1/(userTask.duration/1000/60/60);
                userTask.paceScore = userTask.score/(userTask.duration/1000/60/60);

                userProject.duration += duration;
                userProject.inserts += item.stats.inserts;
                userProject.deletions += item.stats.deletions;
                userProject.files += item.stats.files;
                userProject.score += item.score;
                userProject.pace = 1/(userTask.duration/1000/60/60);
                userProject.paceScore = userProject.score/(userTask.duration/1000/60/60);

                userData.duration += duration;
                userData.inserts += item.stats.inserts;
                userData.deletions += item.stats.deletions;
                userData.files += item.stats.files;
                userData.score += item.score;
                userData.pace = 1/(userData.duration/1000/60/60);
                userData.paceScore = userData.score/(userData.duration/1000/60/60);

                result.users[item.email] = userData;
                userData[item.project] = userProject;
                userProject[item.task] = userTask;

            })
        })        
        console.log(JSON.stringify(result));
        return result;

        // daily structure
        //  user
        //      project
        //          task
        //              task stat#1
        //              task 

        


    }

    async effort(auth, params, body){
        const events = persistentStore.events();

        //     count: items.length,
                //     items: items ||[] 
        return events;                
    }

}

module.exports = {Manager};