const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Set up Global configuration access
dotenv.config();

const {Manager} = require('./manager')
const manager = new Manager({});
const log = require('electron-log');

const app = express();

let PORT = process.env.MS_PORT || 5001;

const apiName = "Hooks";
const version = "v1";
const path = "hooks";


log.info(`${apiName} API Starting...`);

app.listen(PORT, () => {
    log.info(`${apiName} API is up and running on ${PORT} ...`);
});

app.use(bodyParser.urlencoded({ extended: true, limit: "2048mb" }));
app.use(bodyParser.json({limit: "2048mb"}));


function attachNewGetOperation(appHandler, version, path, context, operationHandlerMethod){
    appHandler.get(`/${version}/${path}${context}`, (req, res) => {	
        try{
            operationHandlerMethod(req.auth, req.params, req.body).then((items)=>{            
                // const response = {
                //     count: items.length,
                //     items: items ||[] 
                // }          
                res.send(items);
            }).catch ((error)=>{
                log.log(error);
                return res.status(500).send("Uuups something went wrong. We are working on it.");
            })        
        }catch(error){        
            log.log(error);
            return res.status(500).send("Uuups something went wrong. We are working on it.");
        }        
    });
}

function attachNewPostOperation(appHandler, version, path, context, operationHandlerMethod){
    appHandler.post(`/${version}/${path}${context}`, (req, res) => {	
        try{
            
            operationHandlerMethod(req.auth, req.params, req.body).then((items)=>{            
                // const response = {
                //     count: items.length,
                //     items: items ||[] 
                // }          
                res.send(items);
            }).catch ((error)=>{
                log.log(error);
                return res.status(500).send("Uuups something went wrong. We are working on it.");
            })        
        }catch(error){        
            log.log(error);
            return res.status(500).send("Uuups something went wrong. We are working on it.");
        }        
    });
}
attachNewPostOperation(app, version, path, "/commit", manager.change.bind(manager));
attachNewPostOperation(app, version, path, "/push", manager.change.bind(manager));


