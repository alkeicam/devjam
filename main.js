// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')

const CONSTANTS = require("./logic/constants");
const persistentStore = require("./logic/store")

const { ipcMain } = require('electron')

const AppMenu = require("./logic/menu")
const SyncManager = require("./logic/sync-manager")

const context = {
  syncManager: undefined
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({    
    width: 1600,
    height: 1240,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('app/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  const appMenu = new AppMenu(mainWindow);
  appMenu.updateMenu();
  mainWindow.on("show",()=>{
    mainWindow.webContents.send("listener_appShowed",{});
    setTimeout(() => {
      mainWindow.focus();
    }, 200);    
  })


  
  // make sure that we recheck recent stats when windows is showed

  
//   Menu.setApplicationMenu(Menu.buildFromTemplate([
//     {
//         label: app.getName(),
//         submenu: [
//             {label: 'Quit', role: 'quit'  }]
//     }
// ]))
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // logic  
  require("./logic/controller")

  // githook microservice
  require("./services/githook")

  // websockets
  require("./services/ws")
}).then(async ()=>{
  const preferences = await persistentStore.preferences();

  let syncUrls = preferences&&preferences.syncUrls&&preferences.syncUrls.length>0?preferences.syncUrls:CONSTANTS.SYNC.DEFAULT_URLS;
  let accountId = preferences&&preferences.accountId?preferences.accountId:CONSTANTS.SYNC.DEFAULT_ACCOUNT_ID;

  // start syncing with hub
  context.syncManager = SyncManager.getInstance(CONSTANTS.SYNC.SYNC_INTERVAL_MS, syncUrls, accountId);  

  // update sync manager parameters when preferences change
  
  ipcMain.on('preferencesChanged', (preferences)=>{
    context.syncManager.setSyncUrls(preferences.syncUrls);
    context.syncManager.setAccountId(preferences.accountId);
  });
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.