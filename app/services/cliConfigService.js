import ifNot from 'if-not-running';
import backendService from './backendService';
import { logger } from '../utils/logger';
import cliService from './cliService';
import { cliLocalService } from './cliLocalService';

export class CliConfigService {
  constructor (setState=()=>{}) {
    this.setState = setState
    this.state = {
      cliConfig: undefined
    }
    this.load()
  }

  // state

  getCliConfig() {
    if (!this.state.cliConfig) {
      return undefined
    }
    return this.state.cliConfig;
  }

  getServer() {
    if (!this.state.cliConfig) {
      return undefined
    }
    return this.state.cliConfig.server;
  }

  save (cliConfig) {
    return backendService.cli.setConfig(cliConfig).then(() => {
      logger.info('Save CLI configuration: success')
      cliLocalService.reload()
      cliService.setStartTime()
      cliService.fetchState()
    }).catch(e => {
      logger.error('Save CLI configuration: failed', e)
      throw e
    })
  }

  load () {
    return ifNot.run('cliConfigService:fetchState', () => {
      // fetchState backend
      return backendService.cli.getConfig().then(cliConfigResponse => {
        const cliConfig = cliConfigResponse.config
        console.log('cliConfigService.load',cliConfig)
        // set state
        if (this.state === undefined) {
          console.log('cliConfigService: initializing new state')
          this.state = {
            cliConfig: cliConfig
          }
        } else {
          // new state object
          const currentState = Object.assign({}, this.state)
          console.log('cliConfigService: updating existing state', currentState)
          currentState.cliConfig = cliConfig
          this.state = currentState
        }
        this.pushState()
      })
    })
  }

  pushState () {
    this.setState(this.state.cliConfig)
  }
}

