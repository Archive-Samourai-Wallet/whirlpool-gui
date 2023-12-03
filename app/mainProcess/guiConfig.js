import { logger } from '../utils/logger';
import fs from 'fs';
import Store from 'electron-store';
import { API_MODES, GUI_CONFIG_FILE, STORE_CLILOCAL } from '../const';

const CONFIG_DEFAULT = {
  API_MODE: API_MODES.RELEASE
}

const STORE_CLIURL = "cli.url"
const STORE_APIKEY = "cli.apiKey"
const STORE_GUI_PROXY = "gui.proxy"
const STORE_GUICONFIG_VERSION = "guiConfig.version"

const GUI_CONFIG_VERSION = 1

class GuiConfig {

  constructor() {
    this.store = new Store()
    this.cfg = this.loadConfig()
    this.checkUpgradeGui()
  }

  loadConfig() {
    let config = undefined
    try {
      const data = fs.readFileSync(GUI_CONFIG_FILE, 'utf8')
      if (data) {
        try {
          config = JSON.parse(data);
        } catch (e) {
          logger.error("Could not parse GUI configuration: "+GUI_CONFIG_FILE, e)
        }
      }
    } catch(e) {}
    if (!this.validate(config)) {
      logger.info("Using GUI configuration: default")
      config = CONFIG_DEFAULT
      this.hasConfig = false
    } else {
      logger.info("Using GUI configuration: "+GUI_CONFIG_FILE)
      this.hasConfig = true
    }
    return config
  }

  checkUpgradeGui() {
    const fromGuiConfigVersion = this.store.get(STORE_GUICONFIG_VERSION)
    logger.info("fromGuiConfigVersion=" + fromGuiConfigVersion + ", GUI_CONFIG_VERSION=" + GUI_CONFIG_VERSION)
    if (!fromGuiConfigVersion || fromGuiConfigVersion !== GUI_CONFIG_VERSION) {
      this.upgradeGui(fromGuiConfigVersion)
      this.store.set(STORE_GUICONFIG_VERSION, GUI_CONFIG_VERSION)
    }
  }

  upgradeGui(fromGuiConfigVersion) {
    logger.info("Upgrading GUI: " + fromGuiConfigVersion + " -> " + GUI_CONFIG_VERSION)

    // VERSION 1: use HTTPS
    if (!fromGuiConfigVersion || fromGuiConfigVersion < 1) {
      // move CLIURL to HTTPS
      const cliUrl = this.getCliUrl()
      logger.info("cliUrl=" + cliUrl)
      if (cliUrl && cliUrl.indexOf('http://') !== -1) {
        const cliUrlHttps = cliUrl.replace('http://', 'https://')
        logger.info("Updating cliUrl: " + cliUrl + ' -> ' + cliUrlHttps)
        this.setCliUrl(cliUrlHttps)
      }
    }
  }

  validate(config) {
    if (config) {
      if (config.API_MODE && API_MODES[config.API_MODE]) {
        // valid
        return true
      }
      // invalid
      logger.error("ignoring invalid guiConfig (unknown API_MODE '"+config.API_MODE+"'): "+GUI_CONFIG_FILE)
    } else {
      // or not existing
      logger.info("no guiConfig: " + GUI_CONFIG_FILE)
    }
    return false
  }

  getApiMode() {
    return this.cfg.API_MODE
  }

  hasConfig() {
    return this.hasConfig
  }

  // CLI CONFIG

  setStore(key, value) {
    if (value) {
      logger.info('setStore: set '+key)
      this.store.set(key, value)
    } else {
      logger.info('setStore: delete '+key)
      this.store.delete(key)
    }
  }

  setCliUrl(cliUrl) {
    logger.info('guiConfig: set cliUrl='+cliUrl)
    this.setStore(STORE_CLIURL, cliUrl)
  }

  setCliApiKey(apiKey) {
    this.setStore(STORE_APIKEY, apiKey)
  }

  setCliLocal(cliLocal) {
    this.setStore(STORE_CLILOCAL, cliLocal)
  }

  resetCliConfig() {
    this.store.delete(STORE_CLIURL)
    this.store.delete(STORE_APIKEY)
    this.store.delete(STORE_CLILOCAL)
    this.store.delete(STORE_GUI_PROXY)
  }

  getCliUrl() {
    return this.store.get(STORE_CLIURL)
  }

  getCliApiKey() {
    return this.store.get(STORE_APIKEY)
  }

  getCliLocal() {
    return this.store.get(STORE_CLILOCAL)
  }

  // GUI CONFIG

  setGuiProxy(guiProxy) {
    logger.info('guiConfig: set guiProxy='+guiProxy)
    this.setStore(STORE_GUI_PROXY, guiProxy)
  }

  getGuiProxy() {
    return this.store.get(STORE_GUI_PROXY)
  }
}

const guiConfig = new GuiConfig()
export default guiConfig
