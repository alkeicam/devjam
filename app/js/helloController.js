class HelloController {
    
    constructor(emitter, container) {
        this.CONST = {
        }
        this.emitter = emitter
        this.container = container;
        
        
        
        this.model = {
            queryParams: {
                i: undefined
            },            
            handlers: {
                // handleHide: this.handleHide.bind(this),
            },
            process:{
                step: "ONBOARDING" // PREPARE // WORKOUT                
            },
            forms:{
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

    _ellipsis(text){
        if(text.length<=50)
            return text;
        return text.substring(0,18)+"..."+text.substr(text.length-28, text.length)
    }

    static async getInstance(emitter, container){
        const a = new HelloController(emitter, container)
        // electronAPI.listenerAPI.onEventsSync(async (_event, message)=>{
        // const effortData = await electronAPI.API.effort();                        
        return a;
    }

    async handleJoin(e, that){
        const account = await electronAPI.API.authJoin(that.model.forms.f1.v);  
    }

    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

