const FileManager = require("./file-manager");
const { ipcMain, Menu} = require('electron')

const fileManager = FileManager.getInstance();
const persistentStore = require("./store")
const {Stats} = require("./stats");

const apiManager = require("./apiManager");

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

async function handleApiEffort(){
    return stats.today();
}
ipcMain.handle('api_effort', (electronEE, ...args)=>{return handleApiEffort(...args)});

async function handleApiPreferences(){
    return persistentStore.preferences();
}
ipcMain.handle('api_preferences', (electronEE, ...args)=>{return handleApiPreferences(...args)});

async function handleApiSetupEmail(email){
    persistentStore.addPreferencesEmail(email)    
}
ipcMain.handle('api_setup_email', (electronEE, ...args)=>{return handleApiSetupEmail(...args)});

async function handleApiSetupPreferences(email, syncUrls, accountId, syncIntervalMs){
    persistentStore.addPreferences(email, syncUrls, accountId, syncIntervalMs)
    const preferences = persistentStore.preferences();
    ipcMain.emit("preferencesChanged", preferences)

}
ipcMain.handle('api_setup_preferences', (electronEE, ...args)=>{return handleApiSetupPreferences(...args)});

ipcMain.handle('api_preferences_reset', ()=>{persistentStore.resetPreferences()});


ipcMain.handle('api_auth_join', async (electronEE, invitationCode)=>{
    const response = await apiManager.join(invitationCode);
    persistentStore.addAccount(response.data.account);
    return response.data.account;    
});


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


