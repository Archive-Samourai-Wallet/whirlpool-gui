/**
 *
 * Status
 *
 */

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import mixService from '../../services/mixService';
import * as Icon from 'react-feather';
import utils, { MIXABLE_STATUS, UTXO_STATUS, WHIRLPOOL_ACCOUNTS } from '../../services/utils';
import LinkExternal from '../Utils/LinkExternal';
import modalService from '../../services/modalService';
import TableGeneric from '../TableGeneric/TableGeneric';

const UtxoControls = React.memo(({ utxo }) => {
  return (
    <div className='utxo-controls'>
      {utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT && mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Send to Premix' onClick={() => modalService.openTx0([utxo])}>Premix <Icon.ArrowRight size={12}/></button>}
      {mixService.isStartMixPossible(utxo) && utxo.mixableStatus === MIXABLE_STATUS.MIXABLE && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => mixService.startMixUtxo(utxo)}>Mix <Icon.Play size={12} /></button>}
      {mixService.isStartMixPossible(utxo) && utxo.mixableStatus !== MIXABLE_STATUS.MIXABLE && <button className='btn btn-sm btn-border' title='Add to queue' onClick={() => mixService.startMixUtxo(utxo)}><Icon.Plus size={12} />queue</button>}
      {mixService.isStopMixPossible(utxo) && utxo.status === UTXO_STATUS.MIX_QUEUE && <button className='btn btn-sm btn-border' title='Remove from queue' onClick={() => mixService.stopMixUtxo(utxo)}><Icon.Minus size={12} />queue</button>}
      {mixService.isStopMixPossible(utxo) && utxo.status !== UTXO_STATUS.MIX_QUEUE && <button className='btn btn-sm btn-primary' title='Stop mixing' onClick={() => mixService.stopMixUtxo(utxo)}>Stop <Icon.Square size={12} /></button>}
    </div>
  )
});

const computeUtxosActions = utxos => {
  const actions = []

  let tx0Possible = true;

  for (const utxo of utxos) {
    if (utxo.account !== WHIRLPOOL_ACCOUNTS.DEPOSIT) {
      tx0Possible = false
    }
  }

  if (tx0Possible) {
    actions.push(<button className='btn btn-sm btn-primary' title='Send to Premix' onClick={() => modalService.openTx0(utxos)}>Premix</button>)
  }
  return actions
}

/* eslint-disable react/prefer-stateless-function */
const UtxosTable = ({ controls, pool, mixs, account, utxos, tableKey, actions }) => {

  const [showReadOnly, setShowReadOnly] = useState(false)

  const isReadOnly = utxo => utils.isUtxoReadOnly(utxo) || mixService.getPoolsForUtxo(utxo).length == 0;

  const columns = []
  if (account) {
    columns.push({
      Header: 'Account',
      accessor: o => o.account,
      Cell: o => <small>{o.cell.value}</small>
    })
  }
  columns.push(
    {
      Header: 'UTXO',
      accessor: o => o.hash+':'+o.index,
      Cell: o => {
        const utxo = o.row.original
        return <small>
          <span title={utxo.hash + ':' + utxo.index}>
            <LinkExternal href={utils.linkExplorer(utxo)}>
              {utils.shorten(utxo.hash)}:{utxo.index}
            </LinkExternal>
          </span>{' '}
          <span title='Copy TXID'>
            <Icon.Clipboard
              className='clipboard-icon'
              size={18}
              onClick={() => utils.copyToClipboard(utxo.hash)}
            />
          </span>
        </small>
      }
    },
    {
      Header: 'Address',
      accessor: o => o.address,
      Cell: o => {
        const utxo = o.row.original
        return <small>
          <span title={utxo.address+'\n('+utxo.path+')'}>
            <LinkExternal href={utils.linkExplorerAddress(utxo.address)}>
              {utils.shorten(utxo.address)}
            </LinkExternal>
          </span>{' '}
          <span title='Copy address'>
            <Icon.Clipboard
              className='clipboard-icon'
              size={18}
              onClick={() => utils.copyToClipboard(utxo.address)}
            />
          </span>
        </small>
      }
    },
    {
      Header: 'Confs',
      accessor: o => o.confirmations,
      Cell: o => o.cell.value > 0 ? (
          <small title="confirmations">{o.cell.value}</small>
        ) : (
          <FontAwesomeIcon icon={Icons.faClock} size='xs' title='Unconfirmed' className='text-muted'/>
        )
    },
    {
      Header: 'Amount',
      accessor: o => o.value,
      Cell: o => utils.toBtc(o.cell.value)
    }
  );
  if (pool) {
    columns.push(
      {
        Header: 'Pool',
        accessor: o => o.poolId,
        Cell: o => {
          const utxo = o.row.original
          return utxo.poolId?utxo.poolId:'-'
        }
      }
    );
  }
  if (mixs) {
    columns.push({
        Header: 'Mixs',
        accessor: o => o.mixsDone,
        Cell: o => !isReadOnly(o.row.original) && <span>{o.cell.value}</span>
      });
  }
  if (pool) {
    columns.push(
      {
        Header: 'Status',
        accessor: o => o.status,
        Cell: o => !isReadOnly(o.row.original) &&
          <span>{utils.statusLabel(o.row.original, true)}</span>
      });
  }
  columns.push({
      Header: 'Last activity',
      id: 'lastActivity',
      accessor: o => o.lastActivity,
      Cell: o => {
        const lastActivity = mixService.computeLastActivity(o.row.original);
        return <small>{lastActivity ? lastActivity : '-'}</small>
      }
    },
    {
      Header: 'Info',
      accessor: o => o.error,
      Cell: o => !isReadOnly(o.row.original) && <div className='utxoMessage'><small>{utils.utxoMessage(o.row.original)}</small></div>
    }
  );
  if (controls) {
    columns.push({
      id: 'utxoControls',
      Header: '',
      Cell: o => !isReadOnly(o.row.original) && <UtxoControls utxo={o.row.original}/>
    })
  }

  const visibleUtxos = showReadOnly ? utxos : utxos.filter(utxo => !isReadOnly(utxo))
  const utxosReadOnly = utxos.filter(utxo => isReadOnly(utxo))
  const amountUtxosReadOnly = utxosReadOnly.map(utxo => utxo.value).reduce((total,current) => total+current, 0)

  const key = tableKey+utils.computeUtxoDataKey(visibleUtxos);


  return (
    <div>
      <div>
        <TableGeneric
          key={key}
          className='table-utxos'
          columns={columns}
          data={visibleUtxos}
          sortBy={[{ id: 'lastActivity', desc: true }]}
          getRowClassName={row => isReadOnly(row.original) ? 'utxo-disabled' : ''}
          onSelect={{
            label: 'utxos',
            labelDetails: utxos => '('+utils.toBtc(utils.sumUtxos(utxos))+' btc)',
            actions: actions ? computeUtxosActions : undefined
          }}
        />
        {visibleUtxos.length == 0 && <div className='text-center text-muted'><small>No utxo yet</small></div>}
      </div>
      {utxosReadOnly.length>0 && <div className='text-center text-muted'>
        <button className='btn btn-sm btn-default text-muted' onClick={() => setShowReadOnly(!showReadOnly)}>
          <FontAwesomeIcon icon={showReadOnly ? Icons.faAngleUp : Icons.faAngleDown} /> {showReadOnly?'Hide':'Show'} {utxosReadOnly.length} non-mixable utxos ({utils.toBtc(amountUtxosReadOnly)}btc)</button>
      </div>}
    </div>
  );
};

export default UtxosTable
