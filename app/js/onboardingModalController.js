class OnboardingModalController {
    constructor(emitter){
        this.emitter = emitter;
        this.model = {
            display: false,
            message: "",
            busy: false,
            form: {
                f1: {
                    value: "",
                    errorMsg: "",
                },
                f2: {
                    value: "",
                    errorMsg: "",
                },
                f3: {
                    value: "",
                    errorMsg: "",
                }
            },
            item: {},
            howMany: 0,
            current: 0,
            notify: {
                errors: []
            }
        }
        this.emitter.on("showModal:onboarding",(item)=>{
            this.model.notify.errors = [];
            this.model.form = {
                f1: {
                    value: item.name,
                    errorMsg: "",
                },
                f2: {
                    value: item.description,
                    errorMsg: "",
                },
                f3: {
                    value: "",
                    errorMsg: "",
                }
            }
            this.model.display = true;
            this.model.item = item
        })
        
    }

    static async getInstance(emitter){
        const a = new OnboardingModalController(emitter)        
        return a;
    }

    async _handleClose(e, that){
        that.model.notify.errors = [];
        that.model.display = false;
    }

    


}