const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  showNag: (title, body) => ipcRenderer.send('show-nag', { title, body }),
  bringToFront: () => ipcRenderer.send('bring-to-front'),
  isElectron: true,
})
