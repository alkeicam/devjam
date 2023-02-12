//TODO - remove
const { BrowserWindow } = require('electron')

class Manager {
    constructor(api){
        this.api = api;
    }

    _paseGitLog(message){
        const lines = message.split(/\r?\n/);
        console.log(lines);

    }

    async commit(auth, params, body){
        

        let buff = Buffer.from(body.gitlog, 'base64');  
        let message = buff.toString('utf-8');

        this._paseGitLog(message);

        BrowserWindow.fromId(1).webContents.send('listener_commitReceived', message);
        // console.log(`Commit received`, body);
    }

    async tasksDelayed(auth){
        
        const tasks = await this.api.tasksApi.tasksDelayed(auth.user.organization_id, auth.user.groups.map((item)=>item.group_id));
        return this._prepareEntities(auth, tasks, true);
    }

    async tasksMy(auth){
        // console.log(auth);
        let allTasks = [];

        // const userCreatedTasks = await this.tasksUserCreated(auth);
        // const userCreatedTasks = await this.api.tasksApi.tasksByCreatorStillOpen(auth.user.user_id, auth.user.organization_id);        
        // const userOwnedTasks = await this.api.tasksApi.tasksByOwnerStillOpen(auth.user.user_id, auth.user.organization_id);
        const userAssignedTasks = await this.api.tasksApi.tasksByAssigneeStillOpen(auth.user.user_id, auth.user.organization_id);
        
        // allTasks.push(...userCreatedTasks);
        // allTasks.push(...userOwnedTasks);
        allTasks.push(...userAssignedTasks);        

        

        return this._prepareEntities(auth, allTasks, true);
    }

    async tasks(auth){    
        let allTasks = [];

        // const userCreatedTasks = await this.tasksUserCreated(auth);
        const userCreatedTasks = await this.api.tasksApi.tasksByCreator(auth.user.user_id, auth.user.organization_id);        
        const userOwnedTasks = await this.api.tasksApi.tasksByOwner(auth.user.user_id, auth.user.organization_id);
        const userAssignedTasks = await this.api.tasksApi.tasksByAssignee(auth.user.user_id, auth.user.organization_id);
        const unassignedTasks = await this.api.tasksApi.tasksNotAssigned(auth.user.organization_id, auth.user.groups.map((item)=>item.group_id))
        allTasks.push(...userCreatedTasks);
        allTasks.push(...userOwnedTasks);
        allTasks.push(...userAssignedTasks);
        allTasks.push(...unassignedTasks);

        

        return this._prepareEntities(auth, allTasks, true);
        //     allTasks.extensions = [];
        // allTasks = await this._tasksAddHeaderExtensions(auth, allTasks);

        // const metadatas = await this._typesForItems(auth, allTasks);
        // // find header metadatas
        // const headerMetadatas = metadatas.filter((item)=>{return item.is_header == true});

        // const result = {
        //     count: allTasks.length,           
        //     metadata: headerMetadatas,
        //     items: allTasks            
        // }
        // return result;       
    }

    async tasksUnassigned(auth){    
        let allTasks = [];

        // const userCreatedTasks = await this.tasksUserCreated(auth);
        const unassignedTasks = await this.api.tasksApi.tasksNotAssigned(auth.user.organization_id, auth.user.groups.map((item)=>item.group_id))
        allTasks.push(...unassignedTasks);

        

        return this._prepareEntities(auth, allTasks, true);
    }

    async task(auth, params, body){
        const task = await this.api.tasksApi.task(params.id, auth.user.organization_id);

        return this._prepareEntities(auth, task, false);
    }

    async form(auth, params, body){
        const task = await this.api.tasksApi.form(params.id, auth.user.organization_id);

        return this._prepareEntities(auth, task, false);
    }

    async entitiesByType(auth, params, body){
        const typeId = params.id;
        const organizationId = auth.user.organization_id;
        // const types = await this.api.organizationApi.organizationType(typeId, organizationId);
        // const type = types[0];
        const entities = await this.api.entitiesApi.entitiesByType(typeId, organizationId);        
        return this._prepareEntities(auth, entities, false);
    }
    
    

    async tasksActive(auth){
        let tasks = await this.api.tasksApi.tasksActive(auth.user.user_id, auth.user.organization_id, auth.user.groups.map((item)=>item.group_id));
        if(tasks.length==0)
            return [];
        
        tasks.extensions = [];

        return this._prepareEntities(auth, tasks, true);

        // tasks = await this._tasksAddHeaderExtensions(auth, tasks);

        // const metadatas = await this._typesForItems(auth, tasks);
        // // find header metadatas
        // const headerMetadatas = metadatas.filter((item)=>{return item.is_header == true});

        // const result = {
        //     count: tasks.length,           
        //     metadata: headerMetadatas,
        //     items: tasks            
        // }
        // return result;
        
    }


    /**
     * Enhances tasks data with metadata specification and tasks' extensions
     * @param {*} auth 
     * @param {Object[]} tasks tasks to be enhanced
     * @param {boolean} onlyHeaders when true only metadatas/extensions marked as header will be returned
     * @returns {{count: number; metadata: Object[]; items: Object[]}} result wrapper
     */
     async _prepareEntities(auth, entities, onlyHeaders=false){
        if(entities.length==0){
            return {
                count: 0,           
                metadata: [],
                items: []
            }
        }
        entities.extensions = [];
        entities = await this._addExtensions(auth, entities, onlyHeaders);

        let metadatas = await this._typesForItems(auth, entities);
        if(onlyHeaders){
            // find header metadatas
            metadatas = metadatas.filter((item)=>{return item.is_header == true});
        }
        

        let result = {
            count: entities.length,           
            metadata: metadatas,
            items: entities            
        }

        // remove duplicates
        result = JSON.parse(JSON.stringify(result, (key, value)=>{
            if (value === null || value === undefined) {
                return undefined;
              }
            
              return value;
        }));
        // exampleObject = JSON.parse(exampleObject);
        return result;       
    }

    /**
     * Enhances tasks data with metadata specification and tasks' extensions
     * @deprecate use prepareEntities() instead
     * @param {*} auth 
     * @param {Object[]} tasks tasks to be enhanced
     * @param {boolean} onlyHeaders when true only metadatas/extensions marked as header will be returned
     * @returns {{count: number; metadata: Object[]; items: Object[]}} result wrapper
     */
    async _prepareTasks(auth, tasks, onlyHeaders=false){
        if(tasks.length==0){
            return {
                count: 0,           
                metadata: [],
                items: []
            }
        }
        tasks.extensions = [];
        tasks = await this._tasksAddExtensions(auth, tasks, onlyHeaders);

        let metadatas = await this._typesForItems(auth, tasks);
        if(onlyHeaders){
            // find header metadatas
            metadatas = metadatas.filter((item)=>{return item.is_header == true});
        }
        

        let result = {
            count: tasks.length,           
            metadata: metadatas,
            items: tasks            
        }

        // remove duplicates
        result = JSON.parse(JSON.stringify(result, (key, value)=>{
            if (value === null || value === undefined) {
                return undefined;
              }
            
              return value;
        }));
        // exampleObject = JSON.parse(exampleObject);
        return result;       
    }

    /**
     * Enhances task items with additional field holding task extensions' values
     * @param {*} auth 
     * @param {*} tasks 
     * @param {boolean} onlyHeaders when true only subset of extensions will be added (extensions which metadata is marked as header)
     * @returns 
     */
     async _addExtensions(auth, entities, onlyHeaders=false){
        let metadatas = await this._typesForItems(auth, entities);
        
        if(onlyHeaders){
            // find header metadatas
            metadatas = metadatas.filter((item)=>{return item.is_header == true});
        }
        
        // console.log("Header metadatas length", headerMetadatas.length);
        // now load all extensions for each of the tasks, only header extensions are loaded
        for(let i=0; i<entities.length; i++){
            const entity = entities[i];
            let extensions = [];
            if(entity.form_id){
                // this is a form
                extensions = await this.api.extensionsApi._extensionsForFormOfMetadatas(entities[i].form_id, auth.user.organization_id, metadatas.map((item)=>item.metadata_id));
            } 
            else if(entity.task_id){
                // this is a task   
                extensions = await this.api.extensionsApi._extensionsForTaskOfMetadatas(entities[i].task_id, auth.user.organization_id, metadatas.map((item)=>item.metadata_id));
            } 
            
            entities[i].extensions = extensions
        }
        return entities;
    }

    /**
     * Enhances task items with additional field holding task extensions' values
     * @param {*} auth 
     * @param {*} tasks 
     * @param {boolean} onlyHeaders when true only subset of extensions will be added (extensions which metadata is marked as header)
     * @returns 
     */
    async _tasksAddExtensions(auth, tasks, onlyHeaders=false){
        let metadatas = await this._typesForItems(auth, tasks);
        
        if(onlyHeaders){
            // find header metadatas
            metadatas = metadatas.filter((item)=>{return item.is_header == true});
        }
        
        // console.log("Header metadatas length", headerMetadatas.length);
        // now load all extensions for each of the tasks, only header extensions are loaded
        for(let i=0; i<tasks.length; i++){
            const taskExtensions = await this.api.extensionsApi._extensionsForTaskOfMetadatas(tasks[i].task_id, auth.user.organization_id, metadatas.map((item)=>item.metadata_id));
            tasks[i].extensions = taskExtensions
        }
        return tasks;
    }

    /**
     * Loads metadata specification for all items provided
     * @param {*} auth 
     * @param {*} items 
     * @returns 
     */
    async _typesForItems(auth, items){
        const typeIds = items.map((item)=>item.type_id);
        const typeIdsSet = new Set(typeIds);
        const typeIdsUnq = Array.from(typeIdsSet);

        const metadatas = await this.api.organizationApi.typesIn(typeIdsUnq.map(item=>parseInt(item)), auth.user.organization_id);
        return metadatas;
    }

    /**
     * @deprecated use _tasksAddExtensions() with onlyHeaders=true
     * @param {*} auth 
     * @param {*} tasks 
     * @returns 
     */
    async _tasksAddHeaderExtensions(auth, tasks){
        return this._tasksAddExtensions(auth, tasks, true);
        // const metadatas = await this._typesForItems(auth, tasks);
        // // find header metadatas
        // const headerMetadatas = metadatas.filter((item)=>{return item.is_header == true});
        // console.log("Header metadatas length", headerMetadatas.length);
        // // now load all extensions for each of the tasks, only header extensions are loaded
        // for(let i=0; i<tasks.length; i++){
        //     const taskExtensions = await this.api.extensionsApi._extensionsForTaskOfMetadatas(tasks[i].task_id, auth.user.organization_id, headerMetadatas.map((item)=>item.metadata_id));
        //     tasks[i].extensions = taskExtensions
        // }
        // return tasks;
    }
    
    /**
     * @deprecated use _prepareTasks() with onlyHeaders=true
     * @param {*} auth 
     * @param {*} tasks 
     * @returns 
     */
    async _prepareTasksForLists(auth, tasks){
        if(tasks.length==0){
            return {
                count: 0,           
                metadata: [],
                items: []
            }
        }
        tasks.extensions = [];
        tasks = await this._tasksAddHeaderExtensions(auth, tasks);

        const metadatas = await this._typesForItems(auth, tasks);
        // find header metadatas
        const headerMetadatas = metadatas.filter((item)=>{return item.is_header == true});

        let result = {
            count: tasks.length,           
            metadata: headerMetadatas,
            items: tasks            
        }

        // remove duplicates
        result = JSON.parse(JSON.stringify(result, (key, value)=>{
            if (value === null || value === undefined) {
                return undefined;
                }
            
                return value;
        }));
        // exampleObject = JSON.parse(exampleObject);
        return result;       
    }

}

module.exports = {Manager};