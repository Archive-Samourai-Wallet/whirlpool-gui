// @flow
import React, { Component } from 'react';
import './PostmixPage.css';
import walletService from '../services/walletService';
import utils, { WHIRLPOOL_ACCOUNTS } from '../services/utils';
import mixService from '../services/mixService';
import modalService from '../services/modalService';
import poolsService from '../services/poolsService';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import UtxosTable from '../components/Utxo/UtxosTable';

type Props = {};

export default class PostmixPage extends Component<Props> {
  props: Props;

  render() {
    if (!walletService.isReady() || !mixService.isReady() || !poolsService.isReady()) {
      return utils.spinner()
    }

    const utxos = walletService.getUtxosPostmix()
    return (
      <div className='postmixPage h-100'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Postmix</h2>
          </div>
          <div className='col-sm-10 stats'>
            <a className='zpubLink' href='#' onClick={e => {modalService.openZpub(WHIRLPOOL_ACCOUNTS.POSTMIX, walletService.getZpubPostmix());e.preventDefault()}}>ZPUB</a>
          </div>
        </div>
        <div className='row h-100 d-flex flex-column'>
          <div className='col-sm-12 flex-grow-1 tablescroll'>
            <UtxosTable tableKey='PostmixPage' utxos={utxos} pool={true} mixs={true} controls={true} account={false}/>
          </div>
        </div>
      </div>
    );
  }
}
