//TODO - remove
const { BrowserWindow } = require('electron')
const persistentStore = require("../../logic/store")

class Manager {
    constructor(api){
        this.api = api;
    }

    _paseGitLog(message){
        const lines = message.split(/\r?\n/);
        console.log(lines);
        const endOfCommitMessage = lines.indexOf("",4);
        // either first word of commit message or in brackets
        const ticket = lines.slice(4,endOfCommitMessage).join("").match(/(\[.+\])/ig)?lines.slice(4,endOfCommitMessage).join("").match(/(\[.+\])/ig)[0].replace(/[\[\]]/ig,""):lines.slice(4,endOfCommitMessage).join("").trim().split(/\s+/ig)[0];
        

        const data = {
            ct: Date.now(),
            raw: message,
            ticket: ticket,
            commit: lines[0],
            author: {
                name: lines[1].replace(/Author\:\s+/ig,"").replace(/\<\S+\>.*/ig,""),
                email: lines[1].replace(/.+\</ig,"").replace(/\>.+/ig,"")
            },
            date: lines[2],
            message: lines.slice(4,endOfCommitMessage).join(""),
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

    _addScore(item){
        item.decoded.s = 0; // initialize score

        // you get 10 points for each push
        if(item.oper == "push"){
            item.decoded.s+=10
            return;
        }
        
        // and point for each insertion, deletion
        item.decoded.s += item.decoded.changeSummary.inserts;
        item.decoded.s += item.decoded.changeSummary.deletions;
    }

    _decode(body){
        let buff = Buffer.from(body.gitlog, 'base64');  
        let message = buff.toString('utf-8');        

        const result = JSON.parse(JSON.stringify(body));
        result.gitlog = message;
        result.decoded = this._paseGitLog(message);

        return result;
        // return {
        //     message: message,
        //     data: this._paseGitLog(message),
        //     oper: body.oper,
            
        // }
    }

    async commit(auth, params, body){
        

        const decoded = this._decode(body);
        this._addScore(decoded);
        persistentStore.addEvent(decoded);
        BrowserWindow.fromId(1).webContents.send('listener_commitReceived', decoded);
        // console.log(`Commit received`, body);
    }

    async push(auth, params, body){
        const decoded = this._decode(body);
        this._addScore(decoded);
        persistentStore.addEvent(decoded);
        BrowserWindow.fromId(1).webContents.send('listener_commitReceived', decoded);
        // console.log(`Commit received`, body);
    }

    async effort(auth, params, body){
        const events = persistentStore.events();

        //     count: items.length,
                //     items: items ||[] 
        return events;                
    }

}

module.exports = {Manager};