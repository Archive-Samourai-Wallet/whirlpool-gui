/**
 *
 * Status
 *
 */

import React from 'react';
import mixService from '../../services/mixService';
import { WHIRLPOOL_ACCOUNTS } from '../../services/utils';
import { Dropdown, DropdownButton } from 'react-bootstrap';

/* eslint-disable react/prefer-stateless-function */
class UtxoPoolSelector extends React.PureComponent {

  computePoolLabel(poolId) {
    return poolId ? poolId : 'none'
  }

  render () {
    const utxo = this.props.utxo
    const pools = mixService.getPoolsForUtxo(utxo);
    if (pools.length == 0) {
      // no pool
      return <span className='text-muted'>-</span>
    }
    const activeLabel = this.computePoolLabel(utxo.poolId)
    if (pools.length < 2 && (!this.props.noPool || !utxo.poolId)) {
      // single choice available
      return <span>{activeLabel}</span>
    }
    return (
      <DropdownButton size='sm' variant="default" title={activeLabel} className='utxoPoolSelector'>
        {pools.map((pool,i) => {
          const poolLabel = this.computePoolLabel(pool.poolId)
          return <Dropdown.Item key={i} active={utxo.poolId === pool.poolId} onClick={() => mixService.setPoolId(utxo, pool.poolId)}>{poolLabel}</Dropdown.Item>
        })}
        {(this.props.noPool || !utxo.poolId) && <Dropdown.Divider />}
        {(this.props.noPool || !utxo.poolId) && <Dropdown.Item active={!utxo.poolId} onClick={() => mixService.setPoolId(utxo, undefined)}>{this.computePoolLabel(undefined)}</Dropdown.Item>}
      </DropdownButton>
    )
  }
}

export default UtxoPoolSelector
