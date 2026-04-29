import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('desktopApp', {
  isElectron: true,
  platform: process.platform,
  openDashboardSectionWindow: (payload) =>
    ipcRenderer.invoke('dashboard-window:open-section', payload),
  broadcastDashboardSync: (payload) => ipcRenderer.send('dashboard-sync:broadcast', payload),
  onDashboardSync: (callback) => {
    if (typeof callback !== 'function') return () => {}

    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('dashboard-sync:payload', listener)
    return () => ipcRenderer.removeListener('dashboard-sync:payload', listener)
  },
  onDashboardWindowClosed: (callback) => {
    if (typeof callback !== 'function') return () => {}

    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('dashboard-window:closed', listener)
    return () => ipcRenderer.removeListener('dashboard-window:closed', listener)
  },
})
