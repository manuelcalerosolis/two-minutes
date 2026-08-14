const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('twoMinutes', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: value => ipcRenderer.invoke('settings:set', value),
  onKeyboardActivity: callback => ipcRenderer.on('keyboard-activity', callback),
  onDetectorStatus: callback => ipcRenderer.on('detector-status', (_event, value) => callback(value)),
  onRearmTimer: callback => ipcRenderer.on('rearm-timer', callback),
  reportTimerStatus: value => ipcRenderer.send('timer:status', value),
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close')
});
