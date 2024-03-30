import ifNot from 'if-not-running';
import backendService from './backendService';
import utils, { TX0_MIN_CONFIRMATIONS, UTXO_STATUS, WHIRLPOOL_ACCOUNTS } from './utils';
import poolsService from './poolsService';
import walletService from './walletService';
import cliService from './cliService';

const REFRESH_RATE = 3000;
const MIX_HISTORY_INITIAL = {
  "startupTime":new Date().getTime(),
  "mixedCount":0,
  "failedCount":0,
  "mixedLastTime":undefined,
  "failedLastTime":undefined,
  "mixedVolume":0,
  "externalXpubCount":0,
  "externalXpubVolume":0,
  "externalXpubLastTime":undefined,
}
class MixService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
  }

  init (state, setState) {
    ifNot.run('mixService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('mixState: init...')
        if (state !== undefined) {
          console.log('mixState: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('mixState: already initialized')
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
    return this.state && this.state.mix
  }

  // controls global

  startMix() {
    return backendService.mix.start().then(() => this.fetchState())
  }

  stopMix() {
    return backendService.mix.stop().then(() => this.fetchState())
  }

  // controls utxo

  getPoolsForTx0(utxo) {
    return poolsService.getPoolsForTx0(utxo.value)
  }

  isTx0Possible(utxo) {
    return (utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT || utxo.account === WHIRLPOOL_ACCOUNTS.PREMIX)
      && (utxo.status === 'READY' || utxo.status === 'TX0_FAILED')
      && utxo.confirmations >= TX0_MIN_CONFIRMATIONS
      && this.getPoolsForTx0(utxo).length > 0
  }

  tx0(utxos, tx0FeeTarget, mixFeeTarget, poolId) {
    return backendService.tx0.tx0(utxos, tx0FeeTarget, mixFeeTarget, poolId).then(() => walletService.fetchState())
  }

  startMixUtxo(utxo) {
    return backendService.utxo.startMix(utxo.hash, utxo.index).then(() => this.refresh())
  }

  refresh() {
    const walletState = walletService.fetchState()
    const state = this.fetchState()
    return Promise.all([walletState, state])
  }

  stopMixUtxo(utxo) {
    return backendService.utxo.stopMix(utxo.hash, utxo.index).then(() => this.refresh())
  }

  getPoolsForMix(utxo) {
    const liquidity = utxo.account === WHIRLPOOL_ACCOUNTS.POSTMIX
    return poolsService.getPoolsForMix(utxo.value, liquidity)
  }

  getPoolsForUtxo(utxo) {
    if (utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT) {
      return this.getPoolsForTx0(utxo)
    }
    return this.getPoolsForMix(utxo)
  }

  isStartMixPossible(utxo) {
    return (utxo.account === WHIRLPOOL_ACCOUNTS.PREMIX || utxo.account === WHIRLPOOL_ACCOUNTS.POSTMIX)
      && (utxo.status === UTXO_STATUS.MIX_FAILED || utxo.status === UTXO_STATUS.READY || utxo.status === UTXO_STATUS.STOP)
      && this.getPoolsForMix(utxo).length > 0
  }

  isStopMixPossible(utxo) {
    return (utxo.account === WHIRLPOOL_ACCOUNTS.PREMIX || utxo.account === WHIRLPOOL_ACCOUNTS.POSTMIX)
      && (utxo.status === UTXO_STATUS.MIX_QUEUE || utxo.status === UTXO_STATUS.MIX_STARTED || utxo.status === UTXO_STATUS.MIX_SUCCESS)
  }

  // state

  computeLastActivity(utxo) {
    if (!utxo.lastActivity) {
      return undefined
    }
    return utils.durationElapsed(utxo.lastActivity)
  }

  isStarted () {
    return this.state.mix.started;
  }

  getNbMixing() {
    return this.state.mix.nbMixing;
  }

  getNbQueued() {
    return this.state.mix.nbQueued;
  }

  getThreads() {
    return this.state.mix.threads;
  }

  getMixHistory() {
    return this.state.mix.mixHistory || MIX_HISTORY_INITIAL
  }

  getLastBlock() {
    return this.state.mix.lastBlock
  }

  fetchState () {
    return ifNot.run('mixService:fetchState', () => {
      if (!cliService.isConfigured()) {
        console.log('CLI is not configured yet')
        return;
      }
      // fetchState backend
      return backendService.mix.fetchState().then(mix => {
        mix.fetchTime = new Date().getTime()
        // set state
        if (this.state === undefined) {
          console.log('mixService: initializing new state')
          this.state = {
            mix: mix
          }
        } else {
          // new state object
          const currentState = Object.assign({}, this.state)
          console.log('mixService: updating existing state', currentState)
          currentState.mix = mix
          this.state = currentState
        }
        this.pushState()
      }).catch(e => {
        console.warn('', e)
      })
    })
  }

  fetchMixHistory () {
    if (!cliService.isConfigured()) {
      console.log('CLI is not configured yet')
      return;
    }
    // fetchState backend
    return backendService.mix.fetchHistory()
  }

  fetchMixHistoryExternalXpub () {
    if (!cliService.isConfigured()) {
      console.log('CLI is not configured yet')
      return;
    }
    // fetchState backend
    return backendService.mix.fetchHistoryExternalXpub()
  }

  pushState () {
    this.setState(this.state)
  }
}

const mixService = new MixService()
export default mixService
