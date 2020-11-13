// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import * as Icon from 'react-feather';
import utils from '../../services/utils';
import mixService from '../../services/mixService';
import AbstractModal from './AbstractModal';
import poolsService from '../../services/poolsService';
import { TX0_FEE_TARGET } from '../../const';
import backendService from '../../services/backendService';

export default class Tx0Modal extends AbstractModal {
  constructor(props) {
    const initialState = {
      pools: undefined,
      feeTarget: TX0_FEE_TARGET.BLOCKS_2.value,
      poolId: props.utxo.poolId,
    }
    super(props, 'modal-tx0', initialState)

    console.log('Tx0Modal', initialState)

    this.handleChangeFeeTarget = this.handleChangeFeeTarget.bind(this);
    this.handleChangePoolTx0 = this.handleChangePoolTx0.bind(this);
    this.handleSubmitTx0 = this.handleSubmitTx0.bind(this)
    this.fetchPoolsForTx0FeeTarget = this.fetchPoolsForTx0FeeTarget.bind(this)
    this.setStateWithTx0Preview = this.setStateWithTx0Preview.bind(this)

    this.fetchPoolsForTx0FeeTarget(initialState.feeTarget)
  }

  fetchPoolsForTx0FeeTarget(tx0FeeTarget) {
    // fetch pools for tx0 feeTarget
    this.loading("Fetching pools for tx0...", poolsService.fetchPoolsForTx0(this.props.utxo.value, tx0FeeTarget).then(pools => {
      if (pools.length == 0) {
        this.setError("No pool for this utxo and miner fee.")
      }

      const defaultPoolId = pools.length > 0 ? pools[0].poolId : undefined

      // preserve active poolId if still available
      const poolId = (this.state.poolId && pools.filter(p => p.poolId === this.state.poolId).length > 0) ? this.state.poolId : defaultPoolId

      return this.setStateWithTx0Preview({
        poolId: poolId,
        pools: pools
      })
    }))
  }

  setStateWithTx0Preview(newState) {
    const fullState = Object.assign(this.state, newState)
    if (!fullState.feeTarget || !fullState.poolId) {
      // cannot preview yet
      newState.tx0Preview = undefined
      this.setState(
        newState
      )
      return Promise.resolve()
    }
    return this.loading("Fetching tx0 data...", backendService.utxo.tx0Preview(this.props.utxo.hash, this.props.utxo.index, fullState.feeTarget, fullState.poolId).then(tx0Preview => {
      newState.tx0Preview = tx0Preview
      this.setState(
        newState
      )
    }))
  }

  handleChangeFeeTarget(e) {
    const feeTarget = e.target.value

    this.setStateWithTx0Preview({
      feeTarget: feeTarget
    })
    this.fetchPoolsForTx0FeeTarget(feeTarget)
  }

  handleChangePoolTx0(e) {
    const poolId = e.target.value

    this.setStateWithTx0Preview({
      poolId: poolId
    })
  }

  handleSubmitTx0() {
    mixService.tx0(this.props.utxo, this.state.feeTarget, this.state.poolId)
    this.props.onClose();
  }

  renderTitle() {
    return <div>
      Send to Premix
    </div>
  }

  renderButtons() {
    return <Button onClick={this.handleSubmitTx0}>Premix <Icon.ChevronsRight size={12}/></Button>
  }

  renderBody() {
    return <div>
      This will send <strong>{utils.toBtc(this.props.utxo.value)}btc</strong> to Premix and prepare for mixing.<br/>
      Spending <strong>{this.props.utxo.hash}:{this.props.utxo.index}</strong><br/>
      <br/>
      {!this.isLoading() && <div>

        {this.state.pools && this.state.pools.length>0 && <div>
          Pool fee: {this.state.tx0Preview && <span><strong>{utils.toBtc(this.state.tx0Preview.feeValue)} btc</strong></span>}
          <select className="form-control" onChange={this.handleChangePoolTx0} defaultValue={this.state.poolId}>
            {this.state.pools.map(pool => <option key={pool.poolId} value={pool.poolId}>{pool.poolId} · denomination: {utils.toBtc(pool.denomination)} btc · fee: {utils.toBtc(pool.feeValue)} btc</option>)}
          </select>
        </div>}
        <br/>

        Miner fee: {this.state.tx0Preview && <strong>{utils.toBtc(this.state.tx0Preview.minerFee)} btc</strong>}
        <select className="form-control" onChange={this.handleChangeFeeTarget} defaultValue={this.state.feeTarget}>
          {Object.keys(TX0_FEE_TARGET).map(feeTargetKey => {
            const feeTargetItem = TX0_FEE_TARGET[feeTargetKey]
            return <option key={feeTargetItem.value} value={feeTargetItem.value}>{feeTargetItem.label}</option>
          })}
        </select><br/>

        {!this.isError() && <div>
          {this.state.tx0Preview && <div>
            This will generate <strong>{this.state.tx0Preview.nbPremix} premixs</strong> of <strong>{utils.toBtc(this.state.tx0Preview.premixValue)} btc</strong> + <strong>{utils.toBtc(this.state.tx0Preview.changeValue)} btc</strong> change
          </div>}
        </div>}
      </div>}
    </div>
  }
}
