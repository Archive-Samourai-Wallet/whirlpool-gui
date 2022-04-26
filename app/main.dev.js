/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain, systemPreferences } from 'electron';
//import { autoUpdater } from 'electron-updater';
import path from 'path';
import MenuBuilder from './menu';
import { CliLocal } from './mainProcess/cliLocal';
import fs from 'fs';
import { GUI_LOG_FILE, IPC_CAMERA } from './const';
import guiConfig from './mainProcess/guiConfig';

/*export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}*/

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

// prevent multiple processes
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.error("Already running => exit")
  app.quit()
}
else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  /**
   * Add event listeners...
   */

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('ready', async () => {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }

    mainWindow = new BrowserWindow({
      show: false,
      width: 1280,
      height: 728,
      webPreferences: {
        nodeIntegration: true
      }
    });

    const EXTRA_RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'extraResources')
      : path.join(__dirname, '../extraResources');

    const getExtraResource = (resourceFilename: string): string => {
      return path.join(EXTRA_RESOURCES_PATH, resourceFilename);
    }

    // fix Linux icon
    const os = require('os');
    if (os.platform() === 'linux') {
      mainWindow.setIcon(getExtraResource("icon.png"));
    }

    // GUI proxy
    try {
      const guiProxy = guiConfig.getGuiProxy()
      if (guiProxy) {
        // use proxy
        const session = mainWindow.webContents.session
        console.log('Using guiProxy:'+guiProxy)
        session.setProxy({
          proxyRules: guiProxy
        })
      }
    } catch(e) {
      console.error(e)
    }

    ipcMain.on(IPC_CAMERA.REQUEST, async (event) => {
      if (process.platform !== 'darwin' || systemPreferences.getMediaAccessStatus("camera") !== "granted") {
        event.reply(IPC_CAMERA.GRANTED)
      } else {
        const granted = await systemPreferences.askForMediaAccess("camera");

        if (granted) {
          event.reply(IPC_CAMERA.GRANTED)
        } else {
          event.reply(IPC_CAMERA.DENIED)
        }
      }
    });

    // init cliLocal
    const guiLogStream = fs.createWriteStream(GUI_LOG_FILE, { flags: 'a' })
    new CliLocal(ipcMain, mainWindow.webContents, guiLogStream)

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    //new AppUpdater();
  });
}
