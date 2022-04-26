import ifNot from 'if-not-running';
import backendService from './backendService';

const REFRESH_RATE = 600000;
class PoolsService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
  }

  init (state, setState) {
    ifNot.run('poolsService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('poolsState: init...')
        if (state !== undefined) {
          console.log('poolsState: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('poolsState: already initialized')
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
    return this.state && this.state.pools
  }

  // pools

  getPools () {
    if (!this.isReady()) {
      return []
    }
    return this.state.pools.pools;
  }

  fetchPoolsForTx0(utxoBalance, tx0FeeTarget, mixFeeTarget) {
    return backendService.pools.fetchPools(tx0FeeTarget, mixFeeTarget).then(poolsResponse => poolsResponse.pools.filter(pool => utxoBalance >= pool.tx0BalanceMin))
  }

  getPoolsForTx0(utxoBalance) {
    return this.getPools().filter(pool => utxoBalance >= pool.tx0BalanceMin)
  }

  getPoolsForMix(utxoBalance, liquidity) {
    if (liquidity) {
      return this.getPools().filter(pool => utxoBalance == pool.denomination)
    }
    return this.getPools().filter(pool => utxoBalance >= pool.mustMixBalanceMin && utxoBalance <= pool.mustMixBalanceMax)
  }

  findPool(poolId) {
    const results = this.getPools().filter(pool => poolId === pool.poolId)
    return (results.length > 0 ? results[0] : undefined)
  }

  fetchState () {
    return ifNot.run('poolsService:fetchState', () => {
      // fetchState backend
      return backendService.pools.fetchPools().then(pools => {
        pools.fetchTime = new Date().getTime()
        // set state
        if (this.state === undefined) {
          console.log('poolsService: initializing new state')
          this.state = {
            pools: pools
          }
        } else {
          // new state object
          const currentState = Object.assign({}, this.state)
          console.log('poolsService: updating existing state', currentState)
          currentState.pools = pools
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

const poolsService = new PoolsService()
export default poolsService
