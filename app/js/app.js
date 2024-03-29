class AppDemo {
    
    constructor(emitter, container) {
        this.CONST = {
        }
        this.emitter = emitter
        this.container = container;
        
        
        
        this.model = {
            queryParams: {
                i: undefined
            },
            // id: id,
            // label: fileMetadata?.fileName||"Untitled",
            // dirty: fileMetadata?false:true,
            // active: true,
            // parent: this,
            // fileMetadata: fileMetadata||{}
            
            editors: [],
            untitledCnt: 1,
            // last error message
            errorMessage: undefined,
            messages: [],
            last9DaysMessages: [],
            // id
            // active
            // label
            tabs:[{
                id: 0,
                active: true,
                label: "Effort Dashboard",
                that: this
            }],
            accounts:[],
            activeTab: 0,
            onboarding: {
                hide: true
            },
            handlers: {
                handleHide: this.handleHide.bind(this),
                handleUnhide: this.handleUnhide.bind(this),
                handleOnboardProject: this.handleOnboardProject.bind(this)
            },
            process:{
                step: "PREPARE" // PREPARE // WORKOUT                
            },
            sync:{
                code: 0,
                message: ""
            },
            forms:{
                f1: {
                    f1: {
                        v: "",
                        e: {
                            code: 0,
                            message: "OK"
                        }
                    }
                }                
            },
            events: {
                all_time: []
            },
            trends: {
                all_time: {}
            }
        }


          
          

          
    }

    _ellipsis(text){
        if(text.length<=50)
            return text;
        return text.substring(0,18)+"..."+text.substr(text.length-28, text.length)
    }

    async handleSetup(e, that){
        await electronAPI.API.setupEmail(that.model.forms.f1.f1.v)
        that.model.process.step = "PREPARE"
        const effortData = await electronAPI.API.effort();  
        await that.showData2(effortData);  
    }

    async handleOnboardProject(e, that){
        const account = that.model.accounts.find((item)=>{
            return item.id == e.target.dataset.accountId && item.project.id == e.target.dataset.projectId
        })
        that.emitter.emit("showModal:onboarding",account)
    }

    async handleOnboarding(e, that){        
        that.emitter.emit("showModal:onboarding",{})
    }

    async handlePreferences(e, that){    
        const preferences = await electronAPI.API.preferences();
        that.emitter.emit("showModal:preferences",preferences)
    }

    async onPreferencesChange(email, syncUrl, accountId, syncIntervalMs){
        // sync preferences to underlying app
        await electronAPI.API.setupPreferences(email,[syncUrl], accountId, syncIntervalMs);
    }

    async onPreferencesReset(){
        // reset preferences
        await electronAPI.API.preferencesReset();
    }

    static async getInstance(emitter, container){
        const a = new AppDemo(emitter, container)

        const accounts = await electronAPI.API.accounts();
        if(accounts.length == 0){
            // need onboarding
            window.location = "hello.html";
        }
        a.model.accounts = accounts;

        a.emitter.on("PreferencesModalController:preferencesChange", a.onPreferencesChange.bind(a));
        a.emitter.on("External:preferencesReset", a.onPreferencesReset.bind(a));
        a.emitter.on("External:accountsReset", async ()=>{await electronAPI.API.accountsReset()});

        electronAPI.listenerAPI.onEventsSync(async (_event, message)=>{
            // console.log("got sync event", message);
            if(message&&message.sync){
                a.model.sync.code = 0
                a.model.sync.message = message.message
            }else{
                a.model.sync.code = 1
            }
                
        })


        electronAPI.listenerAPI.onCommitReceived(async (_event, message)=>{  
            await a.reloadData()      
            await a.showData2(message);                        
        })

        electronAPI.listenerAPI.onAppShowed(async (_event, message)=>{
            await a.reloadAndShow();
        })
        // load initially        
        await a.reloadAndShow();
        return a;
    }

    async reloadAndShow(){
        await this.reloadData()    
        const effortData = await electronAPI.API.effort();        
        this.showData2(effortData)                   
    }
    
    /**
     * 
     * @returns 
     * @deprecated
     */
    async drawPlot(){
        if(this.container){
            if(!this.model.last9DaysMessages)
                return;

            if(this.model.last9DaysMessages.length == 0)
                return;
                            
            var commits = {
                x: this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse(),
                y: this.model.last9DaysMessages.map((item)=>{
                    if(!item.users[0])
                        return 0;
                    return item.users[0].commitCnt
                }).reverse(),
                name: 'Commits',
                type: 'bar'
            }   
            var pushes = {
                x: this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse(),
                y: this.model.last9DaysMessages.map((item)=>{
                    if(!item.users[0])
                        return 0;
                    return item.users[0].pushCnt
                }).reverse(),
                name: 'Pushes',
                type: 'bar'
            }   
            var calories = {
                x: this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse(),
                y: this.model.last9DaysMessages.map((item)=>{
                    if(!item.users[0])
                        return 0;
                    return item.users[0].score
                }).reverse(),
                name: 'Calories',
                type: 'scatter'
            }             

            var pace = {
                x: this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse(),
                y: this.model.last9DaysMessages.map((item)=>{
                    if(!item.users[0])
                        return 0;
                    return item.users[0].paceScore
                }).reverse(),
                name: 'Pace',
                type: 'bar'
            }        

            
                
            // var trace1 = {
            //     x: ['giraffes', 'orangutans', 'monkeys'],
            //     y: [20, 14, 23],
            //     name: 'SF Zoo',
            //     type: 'bar'
            //   };
              
            //   var trace2 = {
            //     x: ['giraffes', 'orangutans', 'monkeys'],
            //     y: [12, 18, 29],
            //     name: 'LA Zoo',
            //     type: 'bar'
            //   };
              
            //   var data = [calories, pushes, commits];
              var data = [pushes, commits, calories];
              
              var layout = {barmode: 'stack'};
              
              Plotly.newPlot(this.container, data, layout, {displayModeBar: false});
        }                  
    }

    /**
     * 
     * @returns 
     * @deprecated
     */
    async drawHeatmap(){
        if(this.container){
            if(!this.model.last9DaysMessages)
                return;

            if(this.model.last9DaysMessages.length == 0)
                return;

            // const last = this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse()
            const last = this.model.last9DaysMessages
                            
            var data = [
                {
                    // z[i][] - y czyli 24 godziny (24 tabele)
                    // z[][i] - wartosc to ilosc zdarzen w danym dniu tygodnia (czyli tyle wartosci ile dni - 9)
                    // z[0][i] - y
                    // z[j][0] - x
                    z: [[1, null, 30, 50, 1], [20, 1, 60, 80, 30], [30, 60, 1, -10, 20]],
                    x: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    y: ['Morning', 'Afternoon', 'Evening'],
                    type: 'heatmap',
                    hoverongaps: false
                }
                ];
              
              
            // var layout = {barmode: 'stack'};
              
            //   Plotly.newPlot("heatmapGraph", data, layout, {displayModeBar: false});
            Plotly.newPlot('heatmapGraph', data);
        }                  
    }
    
    async reloadData(){
        
        const eventsAllTime = await electronAPI.API.eventsSince(-1);   
        this.model.events.all_time.length = 0;
        eventsAllTime.forEach(item=>this.model.events.all_time.push(item));
        // this.model.trends.all_time = (new EventProcessor()).userTrends(this.model.events.all_time, 14);
        this.model.trends.all_time = (new EventProcessor()).userTrends(this.model.events.all_time, "day", 14);
    }

    async showData2(message){
        let that = this;
        // console.log(`${Date.now()} Got message`, message);  

        if(!message) return;

        let todayMessage = message.find((item)=>{return item.day.today == true});
        // console.log(`todayMessage`, todayMessage); 

        todayMessage.users.sort((a,b)=>{return b.score-a.score});
        todayMessage.users.forEach((user)=>{
            user.projects.sort((a,b)=>{return b.score-a.score});
            user.work = moment.duration(user.duration).humanize();

            

            user.projects.forEach((project)=>{
                // preserve project hide status
                // try to find a matching project in recent messages
                // check if there are any projects already for the given user
                let previousProject = undefined;

                if(Object.keys(that.model.messages).length>0&&that.model.messages.users&&that.model.messages.users.length>0){
                    let usersFromPrevious = that.model.messages.users.find((item)=>{return item.id == user.id});
                    if(usersFromPrevious){
                        // try to find project
                        previousProject = usersFromPrevious.projects.find((item)=>{return item.id == project.id})
                    }
                }
                

                project.tasks.sort((a,b)=>{return b.score-a.score});
                project.work = moment.duration(project.duration).humanize()
                project.id = this._ellipsis(project.id)                
                project.hide = previousProject?previousProject.hide:true
                project.tasks.forEach((task)=>{
                    task.work = moment.duration(task.duration).humanize()
                    // task.id = task.id?task.id:"Unnamed Task"
                })
            })
        });   

        
        
        // a.model.messages.push(message.decoded);
        this.model.messages = todayMessage;
        this.model.last9DaysMessages = message;
        // this.drawPlot();
        // this.drawHeatmap();

        if(this.model.messages.users.length >= 1){
            this.model.process.step = "WORKOUT"
        }else{
            this.model.process.step = "PREPARE";
        }                
    }

    async handleHide(e, that){
        that.project.hide = true;
        // console.log(that);
    }

    async handleUnhide(e, that){
        that.project.hide = false;
        // console.log(that);
    }

    handleCloseErrorMessage(e, that){
        that.model.errorMessage = undefined;
    }

    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

