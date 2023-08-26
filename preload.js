const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  API: {
    effort: () => ipcRenderer.invoke('api_effort'),
    setupEmail: (email) => ipcRenderer.invoke('api_setup_email', email),
    setupPreferences: (email, syncUrls, accountId, syncIntervalMs) => ipcRenderer.invoke('api_setup_preferences', email, syncUrls, accountId, syncIntervalMs),    
    preferences: () => ipcRenderer.invoke('api_preferences'),    
    preferencesReset: () => ipcRenderer.invoke('api_preferences_reset'),    
  },
  // here we send data to callback functions in renderer/view js 
  listenerAPI: {    
    onCommitReceived: (callback) => ipcRenderer.on('listener_commitReceived', callback),
    onAppShowed: (callback) => ipcRenderer.on('listener_appShowed', callback),
    onEventsSync: (callback) => ipcRenderer.on('listener_eventsSync', callback)
    
  }
})

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
  })
  