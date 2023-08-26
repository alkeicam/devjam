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
            activeTab: 0,
            onboarding: {
                hide: true
            },
            handlers: {
                handleHide: this.handleHide.bind(this),
                handleUnhide: this.handleUnhide.bind(this)
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
    }

    async handleOnboarding(e, that){        
        that.emitter.emit("showModal:onboarding",{})
    }

    async handlePreferences(e, that){    
        const preferences = await electronAPI.API.preferences();
        that.emitter.emit("showModal:preferences",preferences)
    }

    async onPreferencesChange(email, syncUrl, accountId){
        await electronAPI.API.setupEmailAndSyncUrl(email,[syncUrl], accountId);
    }

    static async getInstance(emitter, container){
        const a = new AppDemo(emitter, container)

        a.emitter.on("PreferencesModalController:preferencesChange", a.onPreferencesChange.bind(a));

        electronAPI.listenerAPI.onEventsSync(async (_event, message)=>{
            console.log("got sync event", message);
            if(message&&message.sync){
                a.model.sync.code = 0
                a.model.sync.message = message.message
            }else{
                a.model.sync.code = 1
            }
                
        })


        electronAPI.listenerAPI.onCommitReceived(async (_event, message)=>{
            a.showData2(message);                        
        })

        electronAPI.listenerAPI.onAppShowed(async (_event, message)=>{
            const effortData = await electronAPI.API.effort();        
            a.showData2(effortData)                   
        })
        // load initially
        const effortData = await electronAPI.API.effort();        
        a.showData2(effortData)                   
                
        return a;
    }

    async drawPlot(){
        if(this.container){
            if(!this.model.last9DaysMessages)
                return;

            if(this.model.last9DaysMessages.length == 0)
                return;
            
                this.model.last9DaysMessages
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
                name: 'Effort',
                type: 'bar'
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
              var data = [pushes, commits];
              
              var layout = {barmode: 'stack'};
              
              Plotly.newPlot(this.container, data, layout, {displayModeBar: false});
        }                  
    }
    
    async showData2(message){
        let that = this;
        console.log(`${Date.now()} Got message`, message);  

        if(!message) return;

        let todayMessage = message.find((item)=>{return item.day.today == true});
        console.log(`todayMessage`, todayMessage); 

        todayMessage.users.sort((a,b)=>{return b.score-a.score});
        todayMessage.users.forEach((user)=>{
            user.projects.sort((a,b)=>{return b.score-a.score});
            user.work = moment.duration(user.duration).humanize();
            user.projects.forEach((project)=>{
                project.tasks.sort((a,b)=>{return b.score-a.score});
                project.work = moment.duration(project.duration).humanize()
                project.id = this._ellipsis(project.id)                
                project.hide = Object.keys(that.model.messages).length>0&&that.model.messages.users&&that.model.messages.users.length>0?that.model.messages.users.find((item)=>{return item.id == user.id}).projects.find((item)=>{return item.id == project.id}).hide:false
                project.tasks.forEach((task)=>{
                    task.work = moment.duration(task.duration).humanize()
                    // task.id = task.id?task.id:"Unnamed Task"
                })
            })
        });   

        
        
        // a.model.messages.push(message.decoded);
        this.model.messages = todayMessage;
        this.model.last9DaysMessages = message;
        this.drawPlot();

        if(this.model.messages.users.length >= 1){
            this.model.process.step = "WORKOUT"
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

