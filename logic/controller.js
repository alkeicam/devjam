const FileManager = require("./file-manager");
const { ipcMain, Menu} = require('electron')

const fileManager = FileManager.getInstance();
const persistentStore = require("./store")
const {Stats} = require("./stats");

const AppMenu = require("./menu")

const stats = new Stats();

function handleUIEvent (eventName, data){
    
    switch (eventName) {
        case "ui_dirty_count":                        
            const menu = Menu.getApplicationMenu();
            // hide menu save when there are no dirty editors open
            const fileSaveMenuItem = menu?.items.find((item)=>item.id=="file")?.submenu.items.find((item)=>item.id=="save");            
            data>0?fileSaveMenuItem.enabled = true:fileSaveMenuItem.enabled = false;                                
            break; 
        default:
            break;
    }
}


// 
ipcMain.handle('seapi_saveFile', (electronEE, ...args)=>{return fileManager.saveFile(...args)});
ipcMain.handle('seapi_loadFile', (electronEE, ...args)=>{return fileManager.loadFile(...args)});
ipcMain.handle('seapi_editorUIEvent', (electronEE, ...args)=>{return handleUIEvent(...args)});

async function handleApiEffort(){
    return stats.today();
}
ipcMain.handle('api_effort', (electronEE, ...args)=>{return handleApiEffort(...args)});

async function handleApiSetup(preferences){
    persistentStore.addPreferences(preferences)    
}
ipcMain.handle('api_setup', (electronEE, ...args)=>{return handleApiSetup(...args)});




// receive responses from application listeners
ipcMain.on('listener_saveFile_response', async (_event, contents, fileMetadata) => {    
    const fileContents = await fileManager.saveFile(contents, fileMetadata);     
    // and send back data about save file
    _event.sender.send('listener_saveFile_success', fileContents);
    
    if(fileContents.error) return;
    // on success save add newly saved file to recent's list
    const appMenu = new AppMenu();
    appMenu.addRecent({
        label: fileContents.fileName,
        fullPath: fileContents.fullPath
    })
})

