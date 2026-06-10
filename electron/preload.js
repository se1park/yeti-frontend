const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('yetiDesktop', {
  platform: process.platform,
  secureStorage: {
    getItem: (key) => ipcRenderer.invoke('yeti-secure-storage:get', key),
    removeItem: (key) => ipcRenderer.invoke('yeti-secure-storage:remove', key),
    setItem: (key, value) => ipcRenderer.invoke('yeti-secure-storage:set', key, value),
  },
});
