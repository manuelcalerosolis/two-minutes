const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('node:path');
const { InputActivityDetector } = require('./platform/linux-input');
const { SettingsStore } = require('./settings-store');

let mainWindow;
let detector;
let tray;
let quitting = false;
let timerStatus = { state: 'ready', remaining: 120 };
const settings = new SettingsStore(() => app.getPath('userData'));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 330,
    height: 430,
    minWidth: 300,
    minHeight: 360,
    alwaysOnTop: true,
    resizable: false,
    frame: false,
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('close', event => {
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  detector = new InputActivityDetector();
  detector.on('activity', () => mainWindow?.webContents.send('keyboard-activity'));
  detector.on('status', status => mainWindow?.webContents.send('detector-status', status));
  detector.start();
  createTray();
}

function formatRemaining(total) {
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

function showWindow() {
  mainWindow?.show();
  mainWindow?.focus();
}

function updateTray() {
  if (!tray) return;
  const label = timerStatus.state === 'ready'
    ? 'Ready'
    : timerStatus.state === 'running'
      ? `In progress · ${formatRemaining(timerStatus.remaining)}`
      : 'Complete';
  tray.setToolTip(`Two Minutes — ${label}`);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Two Minutes', enabled: false },
    { label, enabled: false },
    { type: 'separator' },
    { label: 'Show timer', click: showWindow },
    { label: 'Ready again', enabled: timerStatus.state === 'finished', click: () => mainWindow?.webContents.send('rearm-timer') },
    { type: 'separator' },
    { label: 'Quit', click: () => { quitting = true; app.quit(); } }
  ]));
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'tray.png'));
  tray.on('click', showWindow);
  updateTray();
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => detector?.stop());

ipcMain.handle('settings:get', () => settings.get());
ipcMain.handle('settings:set', (_event, value) => settings.set(value));
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:close', () => mainWindow?.hide());
ipcMain.on('timer:status', (_event, value) => {
  timerStatus = { state: value.state, remaining: value.remaining };
  updateTray();
});
