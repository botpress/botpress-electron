/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { get } from 'app-root-dir';
import { spawn } from 'child_process';
import fs from 'fs';
import getPort from 'get-port';

const { isPackaged } = app;
const appRootDir = isPackaged ? path.resolve(get(), '../../..') : get();
const botpressPath = appRootDir + '/archives/macos';

const getCommand = async () => {

  const port = await getPort({ port: getPort.makeRange(3000, 3100) });
  const content = `PORT=${port}\nPROJECT_LOCATION=${botpressPath}\nVERBOSITY_LEVEL=2`;

  try {
    fs.writeFileSync(path.join(botpressPath, '.env'), content);
  } catch (error) {
    console.log('🚀 ~ file: main.ts ~ line 41 ~ getCommand ~ error', error);
  }

  return { cmd: path.join(botpressPath, 'bp'), port };
};

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  try {
    mainWindow.webContents.once('did-finish-load', async function () {
      if (!mainWindow) {
        return;
      }
      const { cmd, port } = await getCommand();
      mainWindow.webContents.send(
        'botpress-instance-data',
        'command to be run :' + cmd
      );

      const botpressInstance = spawn(cmd, ['-vv'], {
        env: {
          ...process.env,
          NODE_ENV: 'development'
        },
      });

      botpressInstance.stderr.on('data', function (msg) {
        console.log(msg.toString());
        if (mainWindow) {
          mainWindow.webContents.send('botpress-instance-data', msg.toString());
        }
      });
      botpressInstance.stdout.on('data', function (msg) {
        console.log(msg.toString());
        if (mainWindow) {
          mainWindow.webContents.send('botpress-instance-data', msg.toString());
        }

        if (
          mainWindow &&
          msg.toString().indexOf('Launcher Botpress is exposed at') > -1
        ) {
          mainWindow.loadURL(`http://localhost:${port}`);
        }
      });
    });
  } catch (error) {
    console.log('🚀 ~ file: main.ts ~ line 123 ~ createWindow ~ error', error);
    if (mainWindow) {
      mainWindow.webContents.send('botpress-instance-data', error);
    }
  }

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
