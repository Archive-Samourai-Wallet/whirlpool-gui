// @flow
import React, { useEffect, useState } from 'react';
import './ExternalXpubPage.css';
import walletService from '../services/walletService';
import utils from '../services/utils';
import mixService from '../services/mixService';
import MixResultsTable from '../components/MixResult/MixResultTable';


export default function MixHistoryPage(props) {
  const [mixResults, setMixResults] = useState([])

  useEffect(() => utils.intervalOnUseEffect(() => {
      mixService.fetchMixHistoryExternalXpub().then(
        data => {
          setMixResults(data.mixResults)
        }
      ).catch(e => {
        console.error('', e)
      })
    }), [])

  if (!walletService.isReady() || !mixService.isReady()) {
    return utils.spinner()
  }

  return (
    <div className='externalXpubPage'>
      <div className='row'>
        <div className='col-sm-12'>
          <h2>XPub history</h2>
        </div>
      </div>
      <div className='row h-100 d-flex flex-column'>
        <div className='col-sm-12 flex-grow-1 tablescroll'>
          <div className='text-muted'><strong>{mixService.getMixHistory().externalXpubCount} utxos</strong> (<strong>{utils.toBtc(mixService.getMixHistory().externalXpubVolume)} btc</strong>) mixed to external XPub since startup (<strong>{utils.durationElapsed(mixService.getMixHistory().startupTime)} ago</strong>)
            {mixService.getMixHistory().externalXpubLastTime &&<span>, last one <strong>{utils.durationElapsed(mixService.getMixHistory().externalXpubLastTime)} ago</strong></span>}
          </div>
          <MixResultsTable tableKey='ExternalXpubPage' mixResults={mixResults} showAsUtxo={true}/>
        </div>
      </div>
    </div>
  );
}
