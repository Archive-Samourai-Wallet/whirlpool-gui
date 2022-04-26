import ifNot from 'if-not-running';
import { GUI_VERSION } from '../const';
import cliService from './cliService';
import backendService from './backendService';
import guiConfig from '../mainProcess/guiConfig';
import { API_MODES } from '../mainProcess/cliApiService';

const REFRESH_RATE = 1800000; //30min
class GuiUpdateService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
  }

  init (state, setState) {
    ifNot.run('guiUpdateService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('guiState: init...')
        if (state !== undefined) {
          console.log('guiState: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('guiState: already initialized')
      }
    })
  }

  start() {
    if (this.refreshTimeout === undefined) {
      this.refreshTimeout = setInterval(this.fetchState.bind(this), REFRESH_RATE)
      return this.fetchState()
    }
    return Promise.resolve()
  }

  stop() {
    if (this.refreshTimeout) {
      clearInterval(this.refreshTimeout)
    }
    this.refreshTimeout = undefined
    this.state = {}
  }

  isReady() {
    return this.state && this.state.guiLast
  }

  // getUpdate

  getGuiUpdate () {
    if (!this.isReady() || !cliService.isConnected() || guiConfig.getApiMode() !== API_MODES.RELEASE) {
      return undefined
    }
    const apiMode = guiConfig.getApiMode()
    const serverName = apiMode === API_MODES.QA ? API_MODES.QA : cliService.getServerName()
    if (serverName && this.state.guiLast[serverName] && this.state.guiLast[serverName] !== GUI_VERSION) {
      // update available
      return this.state.guiLast[serverName]
    }
    // no update available
    return undefined
  }

  fetchState () {
    return ifNot.run('guiUpdateService:fetchState', () => {
      // fetch GUI_LAST
      return backendService.gui.versions()
        .then(json => {
          // set state
          if (this.state === undefined) {
            console.log('guiUpdateService: initializing new state')
            this.state = {
              guiLast: json.GUI.LAST
            }
          } else {
            // new state object
            const currentState = Object.assign({}, this.state)
            console.log('guiUpdateService: updating existing state', currentState)
            currentState.guiLast = json.GUI.LAST
            this.state = currentState
          }
          this.pushState()
        })
    })
  }

  pushState () {
    this.setState(this.state)
  }
}

const guiUpdateService = new GuiUpdateService()
export default guiUpdateService
