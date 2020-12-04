// @flow
import React, { Component } from 'react';
import './PremixPage.css';
import walletService from '../services/walletService';
import utils, { WHIRLPOOL_ACCOUNTS } from '../services/utils';
import mixService from '../services/mixService';
import poolsService from '../services/poolsService';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import modalService from '../services/modalService';
import UtxosTable from '../components/Utxo/UtxosTable';

type Props = {};

export default class PremixPage extends Component<Props> {
  props: Props;

  render() {
    if (!walletService.isReady()) {
      return <small>Fetching wallet...</small>
    }
    if (!mixService.isReady()) {
      return <small>Fetching mix state...</small>
    }
    if (!poolsService.isReady()) {
      return <small>Fetching pools...</small>
    }

    const utxos = walletService.getUtxosPremix()
    return (
      <div className='premixPage h-100'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Premix</h2>
          </div>
          <div className='col-sm-10 stats'>
            <a className='zpubLink' href='#' onClick={e => {modalService.openZpub(WHIRLPOOL_ACCOUNTS.PREMIX, walletService.getZpubPremix());e.preventDefault()}}>ZPUB</a>
            <span className='text-primary'>{utxos.length} utxos ({utils.toBtc(walletService.getBalancePremix())}btc)</span>
          </div>
        </div>
        <div className='row h-100 d-flex flex-column'>
          <div className='col-sm-12 flex-grow-1 tablescroll'>
            <UtxosTable tableKey='PremixPage' utxos={utxos}tableKey controls={true} account={false}/>
          </div>
        </div>
      </div>
    );
  }
}
