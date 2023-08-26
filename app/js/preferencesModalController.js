class PreferencesModalController {
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
        this.emitter.on("showModal:preferences",(item)=>{
            this.model.notify.errors = [];
            this.model.form = {
                f1: {
                    value: item.email,
                    errorMsg: "",
                },
                f2: {
                    value: item.syncUrls?item.syncUrls[0]:"",
                    errorMsg: "",
                },
                f3: {
                    value: item.accountId,
                    errorMsg: "",
                }
            }
            this.model.display = true;
            this.model.item = item
        })
        
    }

    static async getInstance(emitter){
        const a = new PreferencesModalController(emitter)        
        return a;
    }

    async _handleOK(e, that){
        
        if(that.validate("f1")&&that.validate("f2")&&that.validate("f3")){
            that.emitter.emit("PreferencesModalController:preferencesChange",that.model.form.f1.value, that.model.form.f2.value, that.model.form.f3.value);
            that.model.notify.errors = [];
            that.model.display = false;
        }

        
    }

    async _handleClose(e, that){
        that.model.notify.errors = [];
        that.model.display = false;
    }

    validate(fieldName){
        let valid = true;
        const messages = {
            f1: "Please provide valid email",
            f2: "Please provide valid url",
            f3: "Please provide account id"
        }
        const validators = {
            f1: /(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi,
            f2: /^(ftp|http|https):\/\/[^ "]+$/gi,
            f3: /.+$/gi
        }

        this.model.form[fieldName].errorMsg = this.model.form[fieldName].value.match(validators[fieldName])?"":messages[fieldName];
        valid = this.model.form[fieldName].errorMsg?false:true;

        // switch(fieldName){
        //     case "f1":
        //         that.model.form[fieldName].errorMsg = that.model.form[fieldName].value.match()?"":"Please provide valid email";
        //         valid = that.model.form[fieldName].errorMsg?true:false;
        //         break;
        //     case "f2":
        //         that.model.form[fieldName].errorMsg = value.match(/^(ftp|http|https):\/\/[^ "]+$/gi)?"":"Please provide valid url";
        //         valid = that.model.form[fieldName].errorMsg?true:false;
        //         break;
        //     case "f3":
        //         that.model.form[fieldName].errorMsg = value&&value.length>0?"":"Please provide account id"
        //         valid = that.model.form[fieldName].errorMsg?true:false;
        //         break;
        // }
        // console.log(fieldName, valid);
        return valid;
    }

    async _handleOnChange(e, that){        
        const fieldName = e.target.dataset.field;                    
        that.validate(fieldName);        
    }

    


}