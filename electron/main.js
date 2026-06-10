const { app, BrowserWindow, Menu, ipcMain, safeStorage, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const isDev = Boolean(process.env.ELECTRON_START_URL);

app.setPath('userData', path.join(app.getPath('appData'), 'YetiDesktop'));

function getSecureStorePath() {
  return path.join(app.getPath('userData'), 'secure-store.json');
}

function readSecureStore() {
  try {
    return JSON.parse(fs.readFileSync(getSecureStorePath(), 'utf8'));
  } catch {
    return {};
  }
}

function writeSecureStore(store) {
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(getSecureStorePath(), JSON.stringify(store), 'utf8');
}

function registerSecureStorageHandlers() {
  ipcMain.handle('yeti-secure-storage:get', async (_event, key) => {
    if (!safeStorage.isEncryptionAvailable()) return null;
    const store = readSecureStore();
    const encrypted = store[key];
    if (!encrypted) return null;

    try {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
    } catch {
      return null;
    }
  });

  ipcMain.handle('yeti-secure-storage:set', async (_event, key, value) => {
    if (!safeStorage.isEncryptionAvailable()) return false;
    const store = readSecureStore();
    store[key] = safeStorage.encryptString(String(value || '')).toString('base64');
    writeSecureStore(store);
    return true;
  });

  ipcMain.handle('yeti-secure-storage:remove', async (_event, key) => {
    const store = readSecureStore();
    delete store[key];
    writeSecureStore(store);
    return true;
  });
}

function getAppUrl() {
  if (process.env.ELECTRON_START_URL) {
    return process.env.ELECTRON_START_URL;
  }

  return pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).toString();
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    backgroundColor: '#f6f7f9',
    autoHideMenuBar: true,
    height: 900,
    minHeight: 720,
    minWidth: 1080,
    show: false,
    title: 'Yeti',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
    width: 1280,
  });

  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const requestUrl = webContents.getURL();
    const isAppUrl = requestUrl.startsWith('file://')
      || requestUrl.startsWith('http://localhost:8081')
      || requestUrl.startsWith('http://127.0.0.1:8081');
    const isMediaPermission = ['media', 'audioCapture', 'microphone'].includes(permission);
    callback(Boolean(isAppUrl && isMediaPermission));
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const isOAuthUrl = [
      'accounts.google.com',
      'kauth.kakao.com',
      'kakao.com',
      'localhost:8081/oauth',
      '127.0.0.1:8081/oauth',
    ].some((host) => url.includes(host));

    if (isOAuthUrl) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          backgroundColor: '#ffffff',
          height: 760,
          parent: mainWindow,
          show: true,
          title: 'Yeti Login',
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
          width: 520,
        },
      };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(getAppUrl());

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerSecureStorageHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
