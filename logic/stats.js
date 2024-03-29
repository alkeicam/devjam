var moment = require('moment');
const persistentStore = require("./store")
const log = require('electron-log');

class Stats {
    constructor(){
        this.last9DaysMs = 1000*60*60*24*9
    }
    
    async _userStartOfWork(email){
        // default start at 8 AM
        const startOfWork = moment().startOf("day").add(8,"hours");
        return startOfWork.valueOf();
    }

    async processSingleDayEvents(dayWrapper){
        dayWrapper.users = [];

        const rawEvents = dayWrapper.events;

        const result = dayWrapper;

        if(!rawEvents)
            return result;

        if(rawEvents.length==0)
            return result;

        const events = rawEvents.map((item)=>{
            return  {
                project: item.remote,
                task: item.decoded.ticket,
                time: item.ct,
                stats: item.decoded.changeSummary,
                score: item.s,
                name: item.decoded.author.name,
                email: item.user?item.user:item.decoded.author.email,
                type: item.oper
            }            
        })

        // console.log(events);
        // sort by date asc
        events.sort((a, b)=>{
            return a.time-b.time;
        })

        // console.log(events);
        let users = [];

        events.forEach((item)=>{
            users.push(item.email);
        })


        // unique users
        users = [...new Set(users)];
        // console.log(users);

        
        
        for(let i=0; i<users.length; i++){
            const email = users[i];
            let time = await this._userStartOfWork(email);

            events.filter((item)=>item.email == email).forEach((item)=>{
                // console.log(`Processing ${JSON.stringify(item)} for user ${email}`);
                // we get events for each of the users, events are time ordered
                const duration = Math.max(item.time-time,0);
                // console.log(`Duration ${duration} from ${item.time} ${time} ${item.time-time}`);
                time = item.time;            
                const userData = result.users.find((subitem)=>{return subitem.id == item.email}) || {
                    id: item.email,
                    duration: 0,
                    inserts: 0,
                    deletions: 0,
                    files: 0,
                    score: 0,
                    pace: 0,
                    paceScore: 0,
                    projects: [],
                    pushCnt: 0,
                    commitCnt: 0
                }
                const userProject = userData.projects.find((subitem)=>{return subitem.id == item.project}) || {
                    id: item.project,
                    duration: 0,
                    inserts: 0,
                    deletions: 0,
                    files: 0,
                    score: 0,
                    pace: 0,
                    paceScore: 0,
                    tasks: [],
                    pushCnt: 0,
                    commitCnt: 0
                }
                const userTask = userProject.tasks.find((subitem)=>{return subitem.id == item.task}) || {
                    id: item.task,
                    duration: 0,
                    inserts: 0,
                    deletions: 0,
                    files: 0,
                    score: 0,
                    pace: 0,
                    paceScore: 0,
                    pushCnt: 0,
                    commitCnt: 0
                }

                userTask.duration += duration;
                userTask.inserts += item.type.toLowerCase()=="commit"?item.stats.inserts:0;
                userTask.deletions += item.type.toLowerCase()=="commit"?item.stats.deletions:0;
                userTask.files += item.type.toLowerCase()=="commit"?item.stats.files:0;
                userTask.score += item.score;
                userTask.pace = 1/(userTask.duration/1000/60/60);
                userTask.paceScore = userTask.score/(userTask.duration/1000/60/60);
                userTask.pushCnt += item.type == "push"?1:0;
                userTask.commitCnt += item.type == "commit"?1:0;

                userProject.duration += duration;
                userProject.inserts += item.type.toLowerCase()=="commit"?item.stats.inserts:0;
                userProject.deletions += item.type.toLowerCase()=="commit"?item.stats.deletions:0;
                userProject.files += item.type.toLowerCase()=="commit"?item.stats.files:0;
                userProject.score += item.score;
                userProject.pace = 1/(userTask.duration/1000/60/60);
                userProject.paceScore = userProject.score/(userProject.duration/1000/60/60);
                userProject.pushCnt += item.type == "push"?1:0;
                userProject.commitCnt += item.type == "commit"?1:0;

                userData.duration += duration;
                userData.inserts += item.type.toLowerCase()=="commit"?item.stats.inserts:0;
                userData.deletions += item.type.toLowerCase()=="commit"?item.stats.deletions:0;
                userData.files += item.type.toLowerCase()=="commit"?item.stats.files:0;
                userData.score += item.score;
                userData.pace = 1/(userData.duration/1000/60/60);
                userData.paceScore = userData.score/(userData.duration/1000/60/60);
                userData.pushCnt += item.type == "push"?1:0;
                userData.commitCnt += item.type == "commit"?1:0;


                result.users = result.users.filter((subitem)=>{return subitem.id != userData.id})
                result.users.push(userData);

                // replace project
                userData.projects = userData.projects.filter((subitem)=>{return subitem.id != userProject.id});
                userData.projects.push(userProject);
                // replace task
                userProject.tasks = userProject.tasks.filter((subitem)=>{return subitem.id != userTask.id});
                userProject.tasks.push(userTask);

            })
        }
        return result;
    }

    wrapWithDayInfo(day, rawEvents){
        const maxCt = rawEvents.reduce((accumulator, current)=>{
            return Math.max(accumulator, current.ct);
        },-1);

        const startOfToday = moment().startOf("day").valueOf();
        const result = {
            day: {
                ts: day,
                today: day>=startOfToday?true:false,
                daysAgo: day>=startOfToday?moment(maxCt).fromNow():moment(day).endOf("day").add(-8,"hours").fromNow(), // -8 hours for "a day ago"
                dayName: moment(day).format("dddd"),
                dayName: moment(day).format("YYYY-MM-DD"),
            },            
            events  : rawEvents
        }

        return result;
    }

    async eventsForLastNDays(ndays){
        const allEvents = persistentStore.events();
        const startOfToday = moment().startOf("day").valueOf();
        const result = [];

        for(let i=0; i<ndays; i++){
            const dayStart = startOfToday-1000*60*60*24*i
            const dayEnd = Math.min(startOfToday-1000*60*60*24*i+1000*60*60*24, moment().valueOf());

            
            // let sot = moment(startOfToday).format("YYYY-MM-DD HH:mm")
            let s = moment(dayStart).format("YYYY-MM-DD HH:mm")
            let e = moment(dayEnd).format("YYYY-MM-DD HH:mm")

            //console.log(i, s, e);

            

            // from newest to oldest
            const dayEvents = allEvents.filter((item)=>{return item.ct>=dayStart && item.ct<dayEnd});            
            result.push(this.wrapWithDayInfo(dayStart, dayEvents));
        }
        return result;
    }

    async today(){
        const result = [];

        const allEventsWrapped = await this.eventsForLastNDays(15);
        for(let i=0; i<allEventsWrapped.length; i++){
            const dayResult = await this.processSingleDayEvents(allEventsWrapped[i])  
            result.push(dayResult);
        }
        
        return result;
    }

    async getEventsSince(sinceMs){
        const allEvents = persistentStore.events();        
        const events = allEvents.filter(item=>item.ct>=sinceMs);

        events.sort((a,b)=>a.ct-b.ct);

        const maxCt = events.map(item=>item.ct).reduce((accu, curr)=>{return Math.max(accu, curr)},-1);
        const minCt = events.map(item=>item.ct).reduce((accu, curr)=>{return Math.min(accu, curr)},Number.MAX_SAFE_INTEGER);

        log.debug(`Retrieved ${events.length} events since ${sinceMs} with min ${minCt} and max ${maxCt}`);


        return events;
    }
}

module.exports = {Stats};