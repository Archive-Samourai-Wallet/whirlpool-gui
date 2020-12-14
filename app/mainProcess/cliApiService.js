import { APP_USERDATA, CLI_QA_URL, CLI_STABLE_URL, IS_DEV } from '../const';
import cliVersion from './cliVersion';
import { logger } from '../utils/logger';
import guiConfig from './guiConfig';

export const API_MODES = {
  RELEASE: 'RELEASE',
  LOCAL: 'LOCAL',
  QA: 'QA'
}
const DL_PATH_LOCAL = '/zl/workspaces/whirlpool/whirlpool-client-cli/target/'

export class CliApiService {
  constructor (apiVersion) {
    let apiMode = guiConfig.getApiMode()
    if (IS_DEV) {
      // use local jar when started with "yarn dev"
      apiMode = API_MODES.LOCAL
    }
    this.apiMode = apiMode
    this.apiVersion = apiVersion
    logger.info('Initializing CliApiService: apiVersion='+this.getVersionName()+", apiMode="+apiMode)
  }

  getApiMode() {
    return this.apiMode
  }

  getApiVersion() {
    return this.apiVersion
  }

  isApiModeRelease() {
    return this.apiMode === API_MODES.RELEASE
  }

  isApiModeLocal() {
    return this.apiMode === API_MODES.LOCAL
  }

  useChecksum() {
    // skip checksum verification when started with "yarn dev"
    return !IS_DEV
  }

  getCliPath() {
    if (this.isApiModeLocal()) {
      // local CLI
      return DL_PATH_LOCAL
    }

    // standard CLI download path
    return APP_USERDATA
  }

  async fetchCliApi() {
    if (this.isApiModeLocal()) {
      // use local jar
      return {
        cliVersion: 'develop-SNAPSHOT',
        filename: 'whirlpool-client-cli-develop-SNAPSHOT-run.jar',
        url: false,
        checksum: false
      }
    }
    const fetchVersion = this.isApiModeRelease() ? this.apiVersion : this.getApiMode()
    try {
      let cliApi = await cliVersion.fetchCliApi(fetchVersion)
      logger.info('Using CLI_API ' + fetchVersion, cliApi)
      const filename = 'whirlpool-client-cli-' + cliApi.CLI_VERSION + '-run.jar'
      const url = (fetchVersion === API_MODES.QA ? CLI_QA_URL : CLI_STABLE_URL) + cliApi.CLI_URL
      return {
        cliVersion: cliApi.CLI_VERSION,
        filename: filename,
        url: url,
        checksum: cliApi.CLI_CHECKSUM
      }
    } catch(e) {
      logger.error("Could not fetch CLI_API "+fetchVersion, e)
      throw e
    }
  }

  getVersionName() {
    let version =  this.apiVersion
    if (!this.isApiModeRelease()) {
      version += " ("+this.apiMode+")"
    }
    return version
  }

}
