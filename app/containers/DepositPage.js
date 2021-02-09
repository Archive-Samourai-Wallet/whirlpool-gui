// @flow
import React, { Component } from 'react';
import './PremixPage.css';
import { bindActionCreators } from 'redux';
import { walletActions } from '../actions/walletActions';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import utils, { WHIRLPOOL_ACCOUNTS } from '../services/utils';
import mixService from '../services/mixService';
import poolsService from '../services/poolsService';
import modalService from '../services/modalService';
import UtxosTable from '../components/Utxo/UtxosTable';

class DepositPage extends Component {

  constructor(props) {
    super(props)
  }

  // tx0

  render() {
    if (!walletService.isReady() || !mixService.isReady() || !poolsService.isReady()) {
      return utils.spinner()
    }

    const utxos = walletService.getUtxosDeposit()
    return (
      <div className='depositPage h-100'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Deposit</h2>
          </div>
          <div className='col-sm-10 stats'>
            <a className='zpubLink' href='#' onClick={e => {modalService.openZpub(WHIRLPOOL_ACCOUNTS.DEPOSIT, walletService.getZpubDeposit());e.preventDefault()}}>ZPUB</a>
          </div>
        </div>
        <div className='row h-100 d-flex flex-column'>
          <div className='col-sm-12 flex-grow-1 tablescroll'>
            <UtxosTable tableKey='DepositPage' utxos={utxos} pool={false} mixs={false} controls={true} account={false} actions={true}/>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    wallet: state.wallet
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    walletActions: bindActionCreators(walletActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DepositPage);
