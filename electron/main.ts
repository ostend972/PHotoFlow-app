

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, dbHandlers } from './ipc/database';
import { settingsHandlers } from './ipc/settings';
import { filesystemHandlers } from './ipc/filesystem';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST = path.join(__dirname, '../dist');
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public');

let win: BrowserWindow | null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset', // Style Mac natif
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if ((process as any).platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Initialisation de la base de données et des IPC
app.whenReady().then(() => {
  initDatabase();
  
  const registerHandlers = (handlers: any) => {
    Object.entries(handlers).forEach(([channel, handler]) => {
      ipcMain.handle(channel, async (event, ...args) => {
        try {
          // @ts-ignore
          return await handler(...args);
        } catch (error) {
          console.error(`Error in IPC ${channel}:`, error);
          throw error;
        }
      });
    });
  };

  registerHandlers(dbHandlers);
  registerHandlers(settingsHandlers);
  registerHandlers(filesystemHandlers);

  createWindow();
});