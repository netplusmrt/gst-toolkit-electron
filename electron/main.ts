import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as url from 'url';
import * as path from 'path';
import { initDb } from './db';

import { registerPartyIpc } from './ipc/party.ipc';
import { registerTcsSalesIpc } from './ipc/tcs_sales.ipc';
import { registerTcsSalesReturnIpc } from './ipc/tcs_sales_return.ipc';
import { registerTaxInvoiceDetailsIpc } from './ipc/tax_invoice_details.ipc';
import { registerPaymentIpc } from './ipc/payment.ipc';
import { registerReportsIpc } from './ipc/reports.ipc';
import { registerAdsCostIpc } from './ipc/ads_cost.ipc';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const startUrl = process.env['ELECTRON_START_URL'] || (app.isPackaged
    ? url.format({
      pathname: path.join(__dirname, `../gst-toolkit/index.html`),
      protocol: 'file:',
      slashes: true
    })
    : 'http://localhost:4200');

  win.loadURL(startUrl);

  win.maximize();
  win.show();

  mainWindow = win;

  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });
}

function sendAutoUpdateStatus(status: string, payload?: any) {
  if (!mainWindow) {
    return;
  }
  mainWindow.webContents.send('autoUpdater:status', { status, payload });
}

function setupAutoUpdater() {
  if (!app.isPackaged) {
    console.log('autoUpdater: skipping in development mode');
    return;
  }

  autoUpdater.autoDownload = true;

  autoUpdater.on('checking-for-update', () => sendAutoUpdateStatus('checking-for-update'));
  autoUpdater.on('update-available', info => sendAutoUpdateStatus('update-available', info));
  autoUpdater.on('update-not-available', info => sendAutoUpdateStatus('update-not-available', info));
  autoUpdater.on('error', err => sendAutoUpdateStatus('error', err?.message || err));
  autoUpdater.on('download-progress', progress => sendAutoUpdateStatus('download-progress', progress));
  autoUpdater.on('update-downloaded', info => {
    sendAutoUpdateStatus('update-downloaded', info);
    // You can choose to auto-install after download:
    // autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdates().catch(err => sendAutoUpdateStatus('error', err?.message || err));
}

app.whenReady().then(() => {
  globalShortcut.register('Alt+Left', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.webContents.navigationHistory.canGoBack()) {
      win.webContents.navigationHistory.goBack();
    }
  });

  initDb();

  registerPartyIpc();
  registerTcsSalesIpc();
  registerTcsSalesReturnIpc();
  registerTaxInvoiceDetailsIpc();
  registerPaymentIpc();
  registerReportsIpc();
  registerAdsCostIpc();

  createWindow();

  setupAutoUpdater();

  ipcMain.handle('autoUpdater:checkForUpdates', async () => {
    if (!app.isPackaged) {
      return { status: 'dev' };
    }
    return autoUpdater.checkForUpdates();
  });

  ipcMain.handle('autoUpdater:restartAndInstall', async () => {
    if (!app.isPackaged) {
      return { status: 'dev' };
    }
    autoUpdater.quitAndInstall();
    return { status: 'restarting' };
  });
});

app.on('window-all-closed', () => { 
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


