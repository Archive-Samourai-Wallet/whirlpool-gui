import { version } from '../package.json';
import electron from 'electron';
import log from 'electron-log';
import { logger } from './utils/logger';

/* shared with mainProcess */

export const API_VERSION = '0.10';

export const GUI_VERSION = version;

export const DEFAULT_CLI_LOCAL = true;
export const DEFAULT_CLIPORT = 8899;

export const VERSIONS_URL = "https://code.samourai.io/whirlpool/whirlpool-runtimes/raw/master/CLI.json"
export const CLI_STABLE_URL = 'https://code.samourai.io/whirlpool/whirlpool-client-cli'
export const CLI_QA_URL = 'https://code.samourai.io/whirlpool/QA'

export const IPC_CLILOCAL = {
  GET_STATE: 'cliLocal.getState',
  STATE: 'cliLocal.state',
  RELOAD: 'cliLocal.reload',
  STOP: 'cliLocal.stop',
  DELETE_CONFIG: 'cliLocal.deleteConfig'
};
export const IPC_CAMERA = {
  REQUEST: 'camera.request',
  GRANTED: 'camera.granted',
  DENIED: 'camera.denied'
};
export const CLILOCAL_STATUS = {
  DOWNLOADING: 'DOWNLOADING',
  ERROR: 'ERROR',
  READY: 'READY'
};
export const WHIRLPOOL_SERVER = {
  TESTNET: 'Whirlpool TESTNET',
  MAINNET: 'Whirlpool MAINNET',
  INTEGRATION: 'Whirlpool INTEGRATION'
};

export const TX0_FEE_TARGET = {
  BLOCKS_2: {
    value: 'BLOCKS_2',
    label: 'High priority · in 2 blocks'
  },
  BLOCKS_6: {
    value: 'BLOCKS_6',
    label: 'Medium priority · in 6 blocks'
  },
  BLOCKS_12: {
    value: 'BLOCKS_12',
    label: 'Low priority · in 12 blocks'
  },
  BLOCKS_24: {
    value: 'BLOCKS_24',
    label: 'Lowest priority · in 24 blocks'
  }
}

export const API_MODES = {
  RELEASE: 'RELEASE',
  LOCAL: 'LOCAL',
  QA: 'QA'
}


export const STORE_CLILOCAL = 'cli.local';

const app = electron.app || electron.remote.app
const APP_USERDATA = app.getPath('userData')

export const GUI_PATH = APP_USERDATA
export const GUI_LOG_FILENAME='whirlpool-gui.log'
export const GUI_LOG_FILE = GUI_PATH+'/'+GUI_LOG_FILENAME
log.transports.file.resolvePath = () => GUI_LOG_FILE
export const GUI_CONFIG_FILENAME = 'config.json';
export const GUI_CONFIG_FILE = GUI_PATH+'/'+GUI_CONFIG_FILENAME

export const CLI_CONFIG_FILENAME = 'whirlpool-cli-config.properties';
export const CLI_DL_PATH = APP_USERDATA
export const CLI_LOG_FILE = CLI_DL_PATH+'/whirlpool-cli.log'
export const CLI_LOG_ERROR_FILE = CLI_DL_PATH+'/whirlpool-cli.error.log'

logger.debug('CLI_LOG_FILE='+CLI_LOG_FILE)
logger.debug('CLI_LOG_ERROR_FILE='+CLI_LOG_ERROR_FILE)
logger.debug('GUI_LOG_FILE='+GUI_LOG_FILE)
logger.debug('GUI_CONFIG_FILE='+GUI_CONFIG_FILE)

// accept CLI self-signed certificate
app.commandLine.appendSwitch('ignore-certificate-errors');

