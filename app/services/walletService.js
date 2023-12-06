import ifNot from 'if-not-running';
import backendService from './backendService';
import utils from './utils';

const REFRESH_RATE = 10000;
class WalletService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
  }

  init (state, setState) {
    ifNot.run('walletService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('walletState: init...')
        if (state !== undefined) {
          console.log('walletState: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('walletState: already initialized')
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
    return this.state && this.state.wallet
  }

  // wallet

  getBalance() {
    return this.state.wallet.balance;
  }

  getLastUpdate() {
    return this.state.wallet.lastUpdate;
  }

  getUtxosDeposit () {
    return this.state.wallet.deposit.utxos;
  }

  getUtxosPremix () {
    return this.state.wallet.premix.utxos;
  }

  getUtxosPostmix () {
    return this.state.wallet.postmix.utxos;
  }

  getBalanceDeposit () {
    return this.state.wallet.deposit.balance
  }

  getBalancePremix () {
    return this.state.wallet.premix.balance
  }

  getBalancePostmix () {
    return this.state.wallet.postmix.balance
  }

  getZpubDeposit() {
    return this.state.wallet.deposit.zpub
  }

  getZpubPremix() {
    return this.state.wallet.premix.zpub
  }

  getZpubPostmix() {
    return this.state.wallet.postmix.zpub
  }

  fetchState (refresh=false) {
    return ifNot.run('walletService:fetchState', () => {
      // fetchState backend
      return backendService.wallet.fetchUtxos(refresh).then(wallet => {
        wallet.fetchTime = new Date().getTime()
        // set state
        if (this.state === undefined) {
          console.log('walletService: initializing new state')
          this.state = {
            wallet: wallet
          }
        } else {
          // new state object
          const currentState = Object.assign({}, this.state)
          console.log('walletService: updating existing state', currentState)
          currentState.wallet = wallet
          this.state = currentState
        }
        this.pushState()
      })
    })
  }

  resync() {
    // resync
    backendService.cli.resync()

    // fetch updated utxos
    return this.fetchState()
  }

  // deposit

  fetchDepositAddress (increment=false) {
    return backendService.wallet.fetchDeposit(increment).then(depositResponse => {
      const depositAddress = depositResponse.depositAddress
      return depositAddress;
    })
  }

  fetchDepositAddressDistinct(distinctAddress, increment=false) {
    return this.fetchDepositAddress(increment).then(depositAddress => {
      if (depositAddress === distinctAddress) {
        return this.fetchDepositAddressDistinct(distinctAddress, true).then(distinctDepositAddress => {
          return distinctDepositAddress
        })
      }
      return depositAddress;
    })
  }

  pushState () {
    this.setState(this.state)
  }
}

const walletService = new WalletService()
export default walletService
