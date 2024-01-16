/**
 *
 * Status
 *
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import * as Icon from 'react-feather';
import utils, { UTXO_STATUS } from '../../services/utils';
import LinkExternal from '../Utils/LinkExternal';
import TableGeneric from '../TableGeneric/TableGeneric';
import MixStatus from '../MixStatus';

/* eslint-disable react/prefer-stateless-function */
const MixResultsTable = ({ mixResults, tableKey, actions, showAsUtxo }) => {

  const columns = []
  if (!showAsUtxo) {
    columns.push(
      {
        Header: 'Type',
        accessor: o => o.remix,
        Cell: o => <small>{o.cell.value ? 'REMIX' : 'MIX'}</small>
      },
      {
        Header: 'Destination',
        accessor: o => o.destinationType,
        Cell: o => o.cell.value ? <small>{o.cell.value}</small> : ''
      }
    );
  }
  columns.push(
    {
      Header: 'UTXO',
      accessor: o => o.destinationUtxo ? o.destinationUtxo.hash+':'+o.destinationUtxo.index : undefined,
      Cell: o => {
        if (!o.cell.value) {
          return ''
        }
        const mixResult = o.row.original
        const utxo = mixResult.destinationUtxo
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
      accessor: o => o.destinationAddress,
      Cell: o => {
        if (!o.cell.value) {
          return ''
        }
        const mixResult = o.row.original
        return <small>
          <span title={mixResult.destinationAddress+'\n('+mixResult.destinationPath+')'}>
            <LinkExternal href={utils.linkExplorerAddress(mixResult.destinationAddress)}>
              {utils.shorten(mixResult.destinationAddress)}
            </LinkExternal>
          </span>{' '}
          <span title='Copy address'>
            <Icon.Clipboard
              className='clipboard-icon'
              size={18}
              onClick={() => utils.copyToClipboard(mixResult.destinationAddress)}
            />
          </span>
        </small>
      }
    },
    {
      Header: 'Amount',
      accessor: o => o.amount,
      Cell: o => utils.toBtc(o.cell.value)
    },
    {
      Header: 'Pool',
      accessor: o => o.poolId,
      Cell: o => o.cell.value ? <small>{o.cell.value}</small> : ''
    },
    {
      Header: 'Status',
      accessor: o => o.success,
      Cell: o => (showAsUtxo ? <span><FontAwesomeIcon icon={Icons.faCheck} size='xs' color='green' title='MIXED'/> <span className='text-muted'>MIXED</span></span>
        : <span>{o.cell.value&&<FontAwesomeIcon icon={Icons.faCheck} color='green'title={status}/>} <span className='text-muted'>{o.cell.value ? 'MIXED' : 'FAILED'}</span></span>)
    },
    {
      Header: 'Last activity',
      id: 'time',
      accessor: o => o.time,
      Cell: o => <small>{utils.durationElapsed(o.cell.value)}</small>
    },
    {
      Header: 'Info',
      accessor: o => o.failReason,
      Cell: o => {
        if (!o.cell.value) {
          return ''
        }
        const mixResult = o.row.original
        const failUtxo = mixResult.failUtxo ? mixResult.failUtxo.hash+':'+mixResult.failUtxo.index : ''
        return <div className='utxoMessage'><small>{mixResult.failReason+' '+failUtxo+' '+(mixResult.failError?mixResult.failError:'')}</small></div>
      }
    }
  );

  const sumMixResults = mixs => mixs.reduce(function (sum, mix) {
    return sum + mix.amount;
  }, 0);

  return (
    <div>
      <div>
        <TableGeneric
          key={tableKey}
          className='table-mixResults'
          columns={columns}
          data={mixResults}
          sortBy={[{ id: 'time', desc: true }]}
          onSelect={{
            label: 'mixs',
            labelDetails: mixs => '('+utils.toBtc(sumMixResults(mixs))+' btc)',
          }}
        />
        {mixResults.length == 0 && <div className='text-center text-muted'><small>No mix yet</small></div>}
      </div>
    </div>
  );
};

export default MixResultsTable
