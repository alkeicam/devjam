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
                code: 2,
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
        if(text.length<=40)
            return text;
        return text.substring(0,18)+"..."+text.substr(text.length-18, text.length)
    }

    async handleSetup(e, that){
        await electronAPI.API.setup({
            name: that.model.forms.f1.f1.v,
            status: "OK"
        })
        that.model.process.step = "PREPARE"
    }

    async handleOnboarding(e, that){
        let hide = e.target.dataset.hide || "false";
        if(hide.toLowerCase() === "true")
            that.model.onboarding.hide = true;
        else
            that.model.onboarding.hide = false;
    }

    static async getInstance(emitter, container){
        const a = new AppDemo(emitter, container)

        // listeners from core app
        electronAPI.listenerAPI.onOpenFile((_event, fileHolder)=>{
            // fileHolder:
            // {
            //     fileName: path.parse(contentsPath).base,
            //     path: path.parse(contentsPath).dir,
            //     fullPath: contentsPath,
            //     contents: decrypted
            // }
            if(fileHolder?.error){
                console.log("error=>", fileHolder.error);
                if(fileHolder.error.notify)
                    a.model.errorMessage = fileHolder.error.message
                return;
            }
               
            a.newEditor(fileHolder);
            // electronAPI.seAPI.editorUIEvent("ui_recents", a.model.editors.reduce((count,editor)=>{return editor.dirty?count+1:count},0));
            
        })

        electronAPI.listenerAPI.onSaveFile((_event)=>{            
            const editor = a.model.editors.find((item)=>{return item.active == true});
            if(!editor.dirty) return;
            const contents = tinymce.get(editor.id)?.getContent({ format: 'text' });
            _event.sender.send('listener_saveFile_response', contents, editor.fileMetadata)
        })

        electronAPI.listenerAPI.onSaveFileSuccess((_event, fileHolder)=>{   
            // fileHolder:
            // {
            //     fileName: path.parse(contentsPath).base,
            //     path: path.parse(contentsPath).dir,
            //     fullPath: contentsPath,
            //     contents: decrypted
            // }        
            if(fileHolder.error){
                console.log("error=>", fileHolder.error);
                if(fileHolder.error.notify)
                    a.model.errorMessage = fileHolder.error.message
                return;
            }   
            const editor = a.model.editors.find((item)=>{return item.active == true});
            editor.dirty = false;
            editor.label = fileHolder.fileName;
            editor.fileMetadata = fileHolder;  
            
            electronAPI.seAPI.editorUIEvent("ui_dirty_count", a.model.editors.reduce((count,editor)=>{return editor.dirty?count+1:count},0));
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

    async showData(message){
        console.log(`Got message`, message);  

        message.users.sort((a,b)=>{return a.score-b.score});
        message.users.forEach((user)=>{
            user.projects.sort((a,b)=>{return a.score-b.score});
            user.projects.forEach((project)=>{
                project.tasks.sort((a,b)=>{return a.score-b.score});
            })
        });

        const items = [];
        
        message.users.forEach((user)=>{                
            items.push({
                user: user.id,
                work: moment.duration(user.duration).humanize(),
                project: "",
                task: "",
                score: user.score,
                files: user.files,
                inserts: user.inserts,
                deletions: user.deletions
            })
            
            user.projects.forEach((project)=>{
                items.push({
                    user: user.id,
                    work: moment.duration(project.duration).humanize(),
                    project: this._ellipsis(project.id),
                    task: "",
                    score: project.score,
                    files: project.files,
                    inserts: project.inserts,
                    deletions: project.deletions
                })
                project.tasks.forEach((task)=>{
                    items.push({
                        user: user.id,
                        work: moment.duration(task.duration).humanize(),
                        project: "",
                        task: task.id,
                        score: task.score,
                        files: task.files,
                        inserts: task.inserts,
                        deletions: task.deletions
                    })
                })
            })                             
        })
        
        // a.model.messages.push(message.decoded);
        this.model.messages = items;
    }
    async showData2(message){
        let that = this;
        console.log(`Got message`, message);  

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

    async newEditor(fileMetadata){
        const that = this;
        const id = `e_${Math.random().toString(36).substring(2, 8)}`;
        this.model.editors.forEach((editor)=>editor.active = false);
        this.model.editors.forEach((editor)=>{
            tinymce.get(editor.id)?.hide();
        });
        this.model.editors.push({
            id: id,
            label: fileMetadata?.fileName||`Untitled-${this.model.untitledCnt++}`,
            dirty: fileMetadata?false:true,
            active: true,
            parent: this,
            fileMetadata: fileMetadata||{}
        });
        
        const holderElement = document.getElementById("editor-holder");
        const newElement = document.createElement("div");
        newElement.setAttribute("id",id);
        // make sure that static tinymce preview is not displayed when editor is hidden
        newElement.setAttribute("style","display: none");
        holderElement.appendChild(newElement);
        
        await tinymce.init({
            selector: `#${id}`,
            height: 760,
            // menubar: true,
            // menubar: 'file edit custom',
            // menubar: 'file',
            
            // menu: {
            //   // file: { title: 'File', items: 'seSaveMenuItem seLoadMenuItem restoredraft | preview | print ' },
            //   file: { title: 'File', items: 'seSaveMenuItem seLoadMenuItem' },
            // },
            // menubar: 'file',
            menubar: false,
            statusbar: false,
            plugins: [
              'advlist','autolink','lists','link','image','charmap','preview','anchor',
              // 'searchreplace visualblocks code fullscreen',
              // 'insertdatetime media table paste code help wordcount save'
                //   'save'
            ],
            // toolbar: 'undo redo | formatselect | save | mybutton',
            toolbar: false,
            content_style: 'body { font-family:Montserrat,Helvetica,Arial,sans-serif; font-size:14px }',
            setup: function(editor) {

              // editor.onBeforeSetContent.add(function(ed, o) {
              //     if (o.initial) {
              //         o.content = o.content.replace(/\r?\n/g, '<br />');
              //     }
              // });

              editor.on("BeforeSetContent",(contentHolder)=>{
                // for text files, treat new lines accordingly
                contentHolder.content = contentHolder.content.replace(/\r?\n/g, '<br />');
              })
            //   'Paste Change input Undo Redo'
              editor.on("Paste input",(event, b)=>{
                // console.log(editor.id);
                // console.log(event, b);
                that.model.editors.forEach((item)=>{
                    if(item.id == editor.id) item.dirty = true;
                });
                electronAPI.seAPI.editorUIEvent("ui_dirty_count", that.model.editors.reduce((count,editor)=>{return editor.dirty?count+1:count},0));
              })

              // editor.ui.registry.addButton('mybutton', {
              //   text: "My Button",
              //   onAction: function () {
              //     alert("My Button clicked!");
              //   }
              // });

            editor.ui.registry.addMenuItem('seSaveMenuItem', {
                text: 'Save',
                icon: 'save',
                onAction: function() {    
                    const content = editor.getContent({ format: 'text' })   
                    // check if we are saving existing file
                    const editorData = that.model.editors.find((item)=>item.id == editor.id);                    
                    electronAPI.seAPI.saveFile(content, editorData.fileMetadata.fullPath);
                }
            });
            editor.ui.registry.addMenuItem('seLoadMenuItem', {
                text: 'Load',
                icon: 'upload',
                onAction: function() {                    
                  editor.setContent("", { format: 'text' });
                  electronAPI.seAPI.loadFile().then((contents)=>{
                    editor.setContent(contents, { format: 'text' });
                  })
                }
            });
            }
          })   
          // make sure the editor is shown as "div" placeholder is forcibly hidden
          tinymce.get(id)?.show();  
        //   tinymce.get(id)?.focus();
          // when editor is created for file contents, populate it
          if(fileMetadata?.contents) tinymce.get(id)?.setContent(fileMetadata?.contents, { format: 'text' });     

          electronAPI.seAPI.editorUIEvent("ui_dirty_count", that.model.editors.reduce((count,editor)=>{return editor.dirty?count+1:count},0));
    }

    handleCloseErrorMessage(e, that){
        that.model.errorMessage = undefined;
    }

    handleSwitchEditor(e, that){        
        that.model.editors.forEach((item)=>{
            item.id == that.editor.id?item.active = true:item.active = false;
            item.id == that.editor.id?tinymce.get(item.id)?.show():tinymce.get(item.id)?.hide();
            if(item.id == that.editor.id)
                tinymce.get(item.id)?.focus();
            
        });
    }

    handleCloseEditor(e, that){  
        const content = tinymce.get(that.editor.id)?.getContent({ format: 'text' });
        // that.editor - clicked editor object
        if(that.editor.dirty && content.length>0){
            console.log("dirty");                        
        }else{
            // close editor
            tinymce.get(that.editor.id)?.remove();
            // clean up editor data
            const idx = that.model.editors.findIndex((item)=>item.id == that.editor.id)
            that.model.editors = that.model.editors.filter((item)=>item.id != that.editor.id);
            const newActiveIdx = Math.max(0,idx-1);
            if(that.model.editors.length>0){
                // show active editor
                that.model.editors[newActiveIdx].active = true;
                tinymce.get(that.model.editors[newActiveIdx].id)?.show();
            }
                
            
            electronAPI.seAPI.editorUIEvent("ui_dirty_count", that.model.editors.reduce((count,editor)=>{return editor.dirty?count+1:count},0));
        }        

    }
    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

