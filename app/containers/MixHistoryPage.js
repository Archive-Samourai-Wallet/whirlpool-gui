// @flow
import React, { useEffect, useState } from 'react';
import './PremixPage.css';
import walletService from '../services/walletService';
import mixService from '../services/mixService';
import utils from '../services/utils';
import MixResultsTable from '../components/MixResult/MixResultTable';

export default function MixHistoryPage(props) {
  const [mixResults, setMixResults] = useState([])

  useEffect(() => utils.intervalOnUseEffect(() => {
      mixService.fetchMixHistory().then(
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
    <div className='lastActivityPage'>
      <div className='row'>
        <div className='col-sm-12'>
          <h2>Mix history</h2>
        </div>
      </div>
      <div className='row h-100 d-flex flex-column'>
        <div className='col-sm-12 flex-grow-1 tablescroll'>
          <div className='text-muted'><strong>{mixService.getMixHistory().mixedCount} utxos</strong> (<strong>{utils.toBtc(mixService.getMixHistory().mixedVolume)} btc</strong>) mixed since startup (<strong>{utils.durationElapsed(mixService.getMixHistory().startupTime)} ago</strong>)
            {mixService.getMixHistory().mixedLastTime &&<span>, last one <strong>{utils.durationElapsed(mixService.getMixHistory().mixedLastTime)} ago</strong></span>}
          </div>
          {mixService.getMixHistory().failedCount>0 && <div className='text-muted'>
            Whirlpool will automatically retry on failed mixs.
          </div>}
          <MixResultsTable tableKey='MixHistoryPage' mixResults={mixResults}/>
        </div>
      </div>
    </div>
  );
}
