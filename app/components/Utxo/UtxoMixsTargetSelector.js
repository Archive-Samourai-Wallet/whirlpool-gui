/**
 *
 * Status
 *
 */

import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import mixService from '../../services/mixService';
import utils, { MIXSTARGET_VALUES } from '../../services/utils';

/* eslint-disable react/prefer-stateless-function */
class UtxoMixsTargetSelector extends React.PureComponent {

  render () {
    const utxo = this.props.utxo

    return (
      <DropdownButton size='sm' variant="default" title={utxo.mixsDone+' / '+utils.mixsTargetLabel(utxo.mixsTargetOrDefault)} className='utxoMixsTargetSelector'>
        {MIXSTARGET_VALUES.map(value => {
          value = parseInt(value)
          const label = utils.mixsTargetLabel(value)
          return <Dropdown.Item key={value} active={value === utxo.mixsTarget} onClick={() => mixService.setMixsTarget(utxo, value)}>{label}</Dropdown.Item>
        })}
      </DropdownButton>
    )
  }
}

export default UtxoMixsTargetSelector
