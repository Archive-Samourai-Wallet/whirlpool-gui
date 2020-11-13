/**
 *
 * Status
 *
 */

import React, { useState } from 'react';
import mixService from '../../services/mixService';
import * as Icon from 'react-feather';
import utils, { MIXABLE_STATUS, UTXO_STATUS, WHIRLPOOL_ACCOUNTS } from '../../services/utils';
import LinkExternal from '../Utils/LinkExternal';
import UtxoPoolSelector from './UtxoPoolSelector';
import modalService from '../../services/modalService';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import {FormCheck} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableGeneric from '../TableGeneric/TableGeneric';

const UtxoControls = React.memo(({ utxo }) => {
  return (
    <div>
      {utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT && mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Send to Premix' onClick={() => modalService.openTx0(utxo)}>Premix <Icon.ArrowRight size={12}/></button>}
      {mixService.isStartMixPossible(utxo) && utxo.mixableStatus === MIXABLE_STATUS.MIXABLE && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => mixService.startMixUtxo(utxo)}>Mix <Icon.Play size={12} /></button>}
      {mixService.isStartMixPossible(utxo) && utxo.mixableStatus !== MIXABLE_STATUS.MIXABLE && <button className='btn btn-sm btn-border' title='Add to queue' onClick={() => mixService.startMixUtxo(utxo)}><Icon.Plus size={12} />queue</button>}
      {mixService.isStopMixPossible(utxo) && utxo.status === UTXO_STATUS.MIX_QUEUE && <button className='btn btn-sm btn-border' title='Remove from queue' onClick={() => mixService.stopMixUtxo(utxo)}><Icon.Minus size={12} />queue</button>}
      {mixService.isStopMixPossible(utxo) && utxo.status !== UTXO_STATUS.MIX_QUEUE && <button className='btn btn-sm btn-primary' title='Stop mixing' onClick={() => mixService.stopMixUtxo(utxo)}>Stop <Icon.Square size={12} /></button>}
    </div>
  )
});

/* eslint-disable react/prefer-stateless-function */
const UtxosTable = ({ controls, account, utxos }) => {

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
            <LinkExternal href={utils.linkExplorerAddress(utxo)}>
              {utils.shorten(utxo.address)}
            </LinkExternal>
          </span>{' '}
          <span title='Copy address'>
            <Icon.Clipboard
              className='clipboard-icon'
              size={18}
              onClick={() => copyToClipboard(utxo.address)}
            />
          </span>
        </small>
      }
    },
    {
      Header: 'Confs',
      accessor: o => o.confirmations,
      className: 'text-muted',
      Cell: o => o.cell.value > 0 ? (
          <small title="confirmations">{o.cell.value}</small>
        ) : (
          <FontAwesomeIcon icon={Icons.faClock} size='xs' title='Unconfirmed'/>
        )
    },
    {
      Header: 'Amount',
      accessor: o => o.value,
      Cell: o => utils.toBtc(o.cell.value)
    },
    {
      Header: 'Pool',
      accessor: o => o.poolId,
      Cell: o => {
        const utxo = o.row.original
        const allowNoPool = utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT;
        return !isReadOnly(utxo) && <UtxoPoolSelector utxo={utxo} noPool={allowNoPool}/>
      }
    },
    {
      Header: 'Mixs',
      accessor: o => o.mixsDone,
      Cell: o => !isReadOnly(o.row.original) && <span>{o.cell.value}</span>
    },
    {
      Header: 'Status',
      accessor: o => o.status,
      Cell: o => !isReadOnly(o.row.original) && <span className='text-primary'>{utils.statusLabel(o.row.original)}</span>
    },
    {
      Header: 'Last activity',
      accessor: o => o.lastActivityElapsed,
      Cell: o => {
        const lastActivity = mixService.computeLastActivity(o.row.original);
        return lastActivity ? lastActivity : '-'
      }
    },
    {
      Header: 'Info',
      accessor: o => o.error,
      className: 'utxoMessage',
      Cell: o => !isReadOnly(o.row.original) && <small>{utils.utxoMessage(o.row.original)}</small>
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

  return (
    <div>
      {utxosReadOnly.length>0 && <div className='text-center text-muted'>
        <FormCheck id="showReadOnly" type="checkbox" label={<span>{utxosReadOnly.length} non-mixable utxos ({utils.toBtc(amountUtxosReadOnly)}btc)</span>} onClick={() => setShowReadOnly(!showReadOnly)} checked={showReadOnly}/>
      </div>}
      <div className='table-utxos'>
        <TableGeneric
          columns={columns}
          data={visibleUtxos}
          sortBy={[{ id: 'lastActivityElapsed', desc: true }]}
          getRowClassName={row => isReadOnly(row.original) ? 'utxo-disabled' : ''}
        />
        {visibleUtxos.length == 0 && <div className='text-center text-muted'><small>No utxo yet</small></div>}
      </div>
    </div>
  );
};

export default UtxosTable
