var moment = require('moment');
const persistentStore = require("./store")

class Stats {
    
    async _userStartOfWork(email){
        // default start at 8 AM
        const startOfWork = moment().startOf("day").add(8,"hours");
        return startOfWork.valueOf();
    }
    async today(){
        const startOfToday = moment().startOf("day").valueOf();
        
        const allEvents = persistentStore.events();
        // console.log(allEvents);
        // get all events from today
        const todayEvents = allEvents.filter((item)=>{return item.ct>=startOfToday});
        // console.log(todayEvents);
        const events = todayEvents.map((item)=>{
            return  {
                project: item.remote,
                task: item.decoded.ticket,
                time: item.ct,
                stats: item.decoded.changeSummary,
                score: item.s,
                name: item.decoded.author.name,
                email: item.decoded.author.email,
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
        console.log(users);

        const result = {
            day: startOfToday,            
            users: []
        }
        
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
                                 
        console.log(JSON.stringify(result));
        return result;
    }
}

module.exports = {Stats};