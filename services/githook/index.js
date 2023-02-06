const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const md5 = require("md5");
var { expressjwt } = require("express-jwt");

// Set up Global configuration access
dotenv.config();

// const {BackendAPI} = require('./db')
// const api = new BackendAPI();
const {Manager} = require('./manager')
// const manager = new Manager(api);
const manager = new Manager({});


const app = express();



let PORT = process.env.PORT || 5001;

const apiName = "Hooks";
const version = "v1";
const path = "hooks";


console.log(`${apiName} API Starting...`);
// api.connect().then(()=>{
//     console.log('Task API DB initialized...');    
    app.listen(PORT, () => {
        console.log(`${apiName} API is up and running on ${PORT} ...`);
        });
// })



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressjwt({secret: process.env.JWT_SECRET_KEY, algorithms: ["HS256"],credentialsRequired: true}));


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
                console.log(error);
                return res.status(500).send("Uuups something went wrong. We are working on it.");
            })        
        }catch(error){        
            console.log(error);
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
                console.log(error);
                return res.status(500).send("Uuups something went wrong. We are working on it.");
            })        
        }catch(error){        
            console.log(error);
            return res.status(500).send("Uuups something went wrong. We are working on it.");
        }        
    });
}


attachNewGetOperation(app, version, path, "/one/:id", manager.task.bind(manager));

attachNewGetOperation(app, version, path, "/form/:id", manager.form.bind(manager));

attachNewGetOperation(app, version, path, "/entities/byType/:id", manager.entitiesByType.bind(manager));


