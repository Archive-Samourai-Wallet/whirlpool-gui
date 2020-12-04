// @flow
import React, { useEffect, useState } from 'react';
import { Alert, Button, Badge } from 'react-bootstrap';
import * as Icon from 'react-feather';
import mixService from '../../services/mixService';
import { TX0_FEE_TARGET } from '../../const';
import utils from '../../services/utils';
import poolsService from '../../services/poolsService';
import backendService from '../../services/backendService';
import GenericModal from './GenericModal';
import ModalUtils from '../../services/modalUtils';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Tx0Modal(props) {
  const {utxos, onClose} = props

  // use first available poolId
  const computeInitialPoolId = utxos => {
    for (const utxo  of utxos) {
      if (utxo.poolId) {
        return utxo.poolId
      }
    }
  }
  const [spendValue, setSpendValue] = useState(utils.sumUtxos(utxos))
  const [poolId, setPoolId] = useState(computeInitialPoolId(utxos))
  const [feeTarget, setFeeTarget] = useState(TX0_FEE_TARGET.BLOCKS_2.value)
  const [pools, setPools] = useState([])
  const [tx0Preview, setTx0Preview] = useState(undefined)

  const modalUtils = new ModalUtils(useState, useEffect)

  // compute spendValue
  useEffect(() => {
    const newSpendValue = utils.sumUtxos(utxos)
    setSpendValue(newSpendValue)
  }, [utxos])

  // compute available pools
  useEffect(() => {
    // fetch pools for tx0 feeTarget
    modalUtils.load("Fetching pools for tx0...", poolsService.fetchPoolsForTx0(spendValue, feeTarget).then(newPools => {
      console.log('????newPools',newPools,spendValue)
      if (newPools.length == 0) {
        modalUtils.setError("No pool for this utxo and miner fee.")
      }
      setPools(newPools)
    }))
  }, [feeTarget, spendValue])

  // compute selected poolId
  useEffect(() => {
    const defaultPoolId = pools.length > 0 ? pools[0].poolId : undefined
    // preserve selected poolId if still available
    const newPoolId = (poolId && pools.filter(p => p.poolId === poolId).length > 0) ? poolId : defaultPoolId
    setPoolId(newPoolId)
  }, [pools])

  const isTx0Possible = (feeTarget, poolId, utxos) => feeTarget && poolId && utxos && utxos.length > 0

  // tx0 preview
  useEffect(() => {
    if (!isTx0Possible(feeTarget, poolId, utxos)) {
      // cannot preview yet
      setTx0Preview(undefined)
    } else {
      // preview
      modalUtils.load("Fetching tx0 data...", backendService.tx0.tx0Preview(utxos, feeTarget, poolId).then(newTx0Preview => {
        setTx0Preview(newTx0Preview)
      }))
    }
  }, [feeTarget, poolId, utxos])

  const submitTx0 = () => {
    mixService.tx0(utxos, feeTarget, poolId)
    onClose();
  }

  return <GenericModal dialogClassName='modal-tx0'
                       modalUtils={modalUtils}
                       title='Send to Premix'
                       buttons={isTx0Possible(feeTarget, poolId, utxos) && <Button onClick={submitTx0}>Premix <Icon.ChevronsRight size={12}/></Button>}
                       onClose={onClose}>

    This will send <strong>{utils.toBtc(spendValue)}btc</strong> to Premix and prepare for mixing.<br/>
    {utxos.length==1 && <div>Spending <strong>{utxos[0].hash}:{utxos[0].index}</strong></div>}
    {utxos.length>1 && <Alert variant='warning'>You are spending <strong>{utxos.length} utxos</strong> at once, this may degrade your privacy. We recommend premixing utxos individually when possible.</Alert>}
    <br/>
    {!modalUtils.isLoading() && <div>

      {pools && pools.length>0 && <div>
        Pool fee: {tx0Preview && <span>
          <strong>{utils.toBtc(tx0Preview.feeValue)} btc</strong> {tx0Preview.feeDiscountPercent>0 && <Badge variant="success">SCODE <FontAwesomeIcon icon={Icons.faLongArrowAltRight} /> {tx0Preview.feeDiscountPercent}% OFF!</Badge>}
        </span>}
        <select className="form-control" onChange={e => setPoolId(e.target.value)} defaultValue={poolId}>
          {pools.map(pool => <option key={pool.poolId} value={pool.poolId}>{pool.poolId} · denomination: {utils.toBtc(pool.denomination)} btc · fee: {utils.toBtc(pool.feeValue)} btc</option>)}
        </select>
      </div>}
      <br/>

      Miner fee: {tx0Preview && <strong>{utils.toBtc(tx0Preview.minerFee)} btc</strong>}
      <select className="form-control" onChange={e => setFeeTarget(e.target.value)} defaultValue={feeTarget}>
        {Object.keys(TX0_FEE_TARGET).map(feeTargetKey => {
          const feeTargetItem = TX0_FEE_TARGET[feeTargetKey]
          return <option key={feeTargetItem.value} value={feeTargetItem.value}>{feeTargetItem.label}</option>
        })}
      </select><br/>

      {!modalUtils.isError() && <div>
        {tx0Preview && <div>
          This will generate <strong>{tx0Preview.nbPremix} premixs</strong> of <strong>{utils.toBtc(tx0Preview.premixValue)} btc</strong> + <strong>{utils.toBtc(tx0Preview.changeValue)} btc</strong> change
        </div>}
      </div>}
    </div>}
  </GenericModal>
}
