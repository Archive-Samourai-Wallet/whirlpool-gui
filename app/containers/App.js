// @flow
import * as React from 'react';
import electron from 'electron';
import { Route, Switch, withRouter } from 'react-router';
import backendService from '../services/backendService';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import walletService from '../services/walletService';
import { bindActionCreators } from 'redux';
import { cliActions } from '../actions/cliActions';
import { guiActions } from '../actions/guiActions';
import { walletActions } from '../actions/walletActions';
import { poolsActions } from '../actions/poolsActions';
import { mixActions } from '../actions/mixActions';
import { Link } from 'react-router-dom';
import * as Icon from 'react-feather';
import routes from '../constants/routes';
import ConfigPage from '../containers/ConfigPage';
import InitPage from '../containers/InitPage';
import PremixPage from './PremixPage';
import DepositPage from '../containers/DepositPage';
import MixHistoryPage from './MixHistoryPage';
import Status from '../components/Status';
import { statusActions } from '../services/statusActions';
import PostmixPage from './PostmixPage';
import ExternalXpubPage from './ExternalXpubPage';
import utils from '../services/utils';
import MixStatus from '../components/MixStatus';
import mixService from '../services/mixService';
import modalService from '../services/modalService';
import Tx0Modal from '../components/Modals/Tx0Modal';
import DepositModal from '../components/Modals/DepositModal';
import ZpubModal from '../components/Modals/ZpubModal';
import poolsService from '../services/poolsService';
import cliService from '../services/cliService';
import ConnectingPage from './ConnectingPage';
import { logger } from '../utils/logger';
import StatusPage from './StatusPage';
import LoginPage from './LoginPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import { GUI_VERSION } from '../const';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import PoolsPage from './PoolsPage';
import guiUpdateService from '../services/guiUpdateService';
import { Alert } from 'react-bootstrap';
import { cliApiService } from '../mainProcess/cliApiService';
import LinkExternal from '../components/Utils/LinkExternal';

type Props = {
  children: React.Node
};

class App extends React.Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.state = {
      // managed by modalService
    }

    // init services
    backendService.init(props.dispatch)
    cliService.init(props.cli, cliState =>
      props.cliActions.set(cliState)
    )
    guiUpdateService.init(props.gui, guiState =>
      props.guiActions.set(guiState)
    )
    mixService.init(props.mix, mixState =>
      props.mixActions.set(mixState)
    )
    walletService.init(props.wallet, walletState =>
      props.walletActions.set(walletState)
    )
    poolsService.init(props.pools, poolsState =>
      props.poolsActions.set(poolsState)
    )
    modalService.init(this.setState.bind(this))

    // start cli
    cliService.start()
  }

  routes() {
    if (cliService.isLoggedIn()) {
      // logged in
      return <Switch>
        <Route path={routes.STATUS} component={StatusPage}/>
        <Route path={routes.DEPOSIT} component={DepositPage}/>
        <Route path={routes.PREMIX} component={PremixPage}/>
        <Route path={routes.POSTMIX} component={PostmixPage}/>
        <Route path={routes.EXTERNAL_XPUB} component={ExternalXpubPage}/>
        <Route path={routes.POOLS} component={PoolsPage}/>
        <Route path={routes.CONFIG} component={ConfigPage}/>
        <Route path={routes.HOME} component={MixHistoryPage}/>
      </Switch>
    }

    if (!cliService.isConfigured() || cliService.isCliStatusNotInitialized()) {
      // not configured/initialized
      return <Switch>
        <Route path={routes.STATUS} component={StatusPage}/>
        <Route path={routes.HOME} component={InitPage}/>
      </Switch>
    }
    if (!cliService.isCliStatusReady()) {
      // not connected
      return <Switch>
        <Route path={routes.STATUS} component={StatusPage}/>
        <Route path={routes.HOME} component={ConnectingPage}/>
      </Switch>
    }
    if (!cliService.isLoggedIn()) {
      return <Switch>
        <Route path={routes.STATUS} component={StatusPage}/>
        <Route path={routes.HOME} component={LoginPage}/>
      </Switch>
    }
  }

  render() {
    try {
      return this.doRender()
    } catch (e) {
      // crash recovery
      logger.error('GUI crashed, reloading...', e)
      const BrowserWindow = (electron.BrowserWindow || electron.remote.BrowserWindow)
      const window = BrowserWindow.getFocusedWindow()
      if (window) {
        window.reload();
      }
      return <h1>Error: {e.message}</h1>
    }
  }

  doRender() {
    const cliLocalStatusIcon = cliService.isCliLocal() ? cliLocalService.getStatusIcon((icon,text)=>icon) : undefined
    const cliStatusIcon = cliService.getStatusIcon((icon,text)=>icon)
    const loginLogoutIcon = cliService.getLoginStatusIcon((icon,text)=>icon)
    const cliInfo = cliService.isCliLocal() ? 'CLI '+cliLocalService.getCliVersionStr():'CLI_API '+cliApiService.getVersionName()
    const torIcon = cliService.isConnected() && cliService.getTorProgressIcon() ? <span className='icon'>{cliService.getTorProgressIcon()}</span> : undefined
    const dojoIcon = cliService.isConnected() && cliService.getDojoIcon() ? <span className='icon'>{cliService.getDojoIcon()}</span> : undefined
    const externalDestinationIcon = cliService.getExternalDestinationIcon()

    const guiUpdate = guiUpdateService.getGuiUpdate()

    return <div className='h-100'>
      <Helmet>
        <title>Whirlpool - Samourai Wallet - GUI {GUI_VERSION}, {cliInfo}</title>
      </Helmet>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <div className='col-sm-3 col-md-2 mr-0 navbar-brand-col'>

          <div className="branding">
            <a href='#' className="brand-logo">
              <span className="logo icon-samourai-logo-trans svglogo"></span>
            </a>
            <a href='#' className='product-title'>Whirlpool</a>
          </div>
          {cliStatusIcon && <div className='cliStatus'>
            <span className='icon'>{cliStatusIcon}</span>
            {dojoIcon}
            {torIcon}
            {externalDestinationIcon}
            <span className='icon'>{loginLogoutIcon}</span>
          </div>}
        </div>
        <div className='col-md-10'>
          {cliService.isLoggedIn() && mixService.isReady() && poolsService.isReady() && <MixStatus mixState={this.props.mix} poolsState={this.props.pools} mixActions={this.props.mixActions}/>}
          {cliService.isCliStatusReady() && !cliService.isLoggedIn() && <div className='text-center'>
            <Link to={routes.HOME}>
              <FontAwesomeIcon icon={Icons.faLock} size='3x' color='#CCC'/>
            </Link>
          </div>}
          {(!cliService.isConfigured() || cliService.isCliStatusNotInitialized()) && <div className='text-center'>
            <Link to={routes.HOME}>
              <FontAwesomeIcon icon={Icons.faCogs} size='3x' color='#CCC'/>
            </Link>
          </div>}
        </div>
      </nav>

      <div className="container-fluid h-100 main-container">

        <div className="row h-100">
          <nav className="col-md-2 d-none d-md-block bg-light sidebar">
            <div className="sidebar-sticky">

              {cliService.isLoggedIn() && walletService.isReady() &&  <div>
                <button className='btn btn-sm btn-primary btn-deposit' onClick={() => modalService.openDeposit()}><Icon.Plus size={12}/> Deposit</button>
                <div>
                  <small>Balance: {utils.toBtc(walletService.getBalance(), true)}</small>{' '}
                  <small className='text-muted' title={'Refresh utxos ('+utils.durationElapsed(walletService.getLastUpdate())+' ago)'}>
                    <a href='#' onClick={e => {walletService.fetchState(true);e.preventDefault()}}><Icon.RefreshCw size={12}/> </a>
                  </small>
                </div>
              </div>}
              <br/>
              <ul className="nav flex-column">
                {cliService.isCliStatusReady() && !cliService.isLoggedIn() && <li className="nav-item">
                  <Link to={routes.HOME} className="nav-link">
                    <span data-feather="terminal"></span>
                    <strong>Authentication</strong>
                  </Link>
                </li>}
                {cliService.isLoggedIn() && walletService.isReady() && <li className="nav-item">
                  <Link to={routes.MIX_HISTORY} className="nav-link">
                      <span data-feather="terminal"></span>
                      Mix history ({mixService.isReady() && <span>{mixService.getMixHistory().mixedCount} · {utils.toBtc(mixService.getMixHistory().mixedVolume, true)}</span>})
                  </Link>
                </li>}
                {cliService.isLoggedIn() && walletService.isReady() && cliService.getExternalDestination() && <li className="nav-item">
                  <Link to={routes.EXTERNAL_XPUB} className="nav-link" title='Utxos successfully mixed-to external XPUB'>
                    <span data-feather="check"></span>
                    External XPUB history
                    ({mixService.getMixHistory().externalXpubCount} · {utils.toBtc(mixService.getMixHistory().externalXpubVolume, true)})
                  </Link>
                </li>}
                {cliService.isLoggedIn() && walletService.isReady() && <br/>}
                {cliService.isLoggedIn() && walletService.isReady() && <li className="nav-item">
                  <Link to={routes.DEPOSIT} className="nav-link" title='Utxos ready to enter Whirlpool'>
                      <span data-feather="plus"></span>
                      Deposit
                      ({walletService.getUtxosDeposit().length} · {utils.toBtc(walletService.getBalanceDeposit(), true)})
                  </Link>
                </li>}
                {cliService.isLoggedIn() && walletService.isReady() && <li className="nav-item">
                  <Link to={routes.PREMIX} className="nav-link" title='Utxos being mixed'>
                    <span data-feather="play"></span>
                    Premix
                    ({walletService.getUtxosPremix().length} · {utils.toBtc(walletService.getBalancePremix(), true)})
                  </Link>
                </li>}
                {cliService.isLoggedIn() && walletService.isReady() && <li className="nav-item">
                  <Link to={routes.POSTMIX} className="nav-link" title='Utxos successfully mixed'>
                    <span data-feather="check"></span>
                    Postmix
                    ({walletService.getUtxosPostmix().length} · {utils.toBtc(walletService.getBalancePostmix(), true)})
                  </Link>
                </li>}
                {cliService.isLoggedIn() && walletService.isReady() && <br/>}
                {cliService.isLoggedIn() && walletService.isReady() && <li className="nav-item">
                  <Link to={routes.POOLS} className="nav-link">
                    <span data-feather="check"></span>
                    Pools
                  </Link>
                </li>}
                {cliService.isConfigured() && cliService.isCliStatusReady() && cliService.isLoggedIn() && <li className="nav-item">
                  <Link to={routes.CONFIG} className="nav-link">
                    <span data-feather="settings"></span>
                    Configuration
                  </Link>
                </li>}
                {(!cliService.isConfigured() || cliService.isCliStatusNotInitialized()) && <li className="nav-item">
                  <Link to={routes.HOME} className="nav-link">
                    <span data-feather="settings"></span>
                    <strong>Setup</strong>
                  </Link>
                </li>}
                <li className="nav-item">
                  <Link to={routes.STATUS} className="nav-link">
                    <span data-feather="terminal"></span>
                    System
                  </Link>
                </li>
              </ul>
              <div className="footerNav">
                <div>
                  {cliService.isConnected() && <small>{cliService.getServerName()}</small>}
                  {cliService.isCliLocal() && <small> {cliLocalStatusIcon} standalone</small>}
                  {!cliService.isCliLocal() && <small>{cliService.getCliUrl()}</small>}
                  {cliService.isConfigured() && cliService.isLoggedIn() && mixService.isReady() && mixService.getLastBlock() && <div title={'Last block: '+mixService.getLastBlock().hash}>
                    <small>at block <LinkExternal href={utils.linkExplorerBlock(mixService.getLastBlock())}>{mixService.getLastBlock().height}</LinkExternal></small>
                  </div>}
                </div>
              </div>
            </div>
            <Status
              status={this.props.status}
              statusActions={this.props.statusActions}
            />
          </nav>

          <main role="main" className="col-md-10 ml-sm-auto col-lg-10 px-4">

            {guiUpdate && <div><br/><Alert variant='warning'>GUI update {guiUpdate} available!</Alert></div>}
            {this.routes()}

            {this.state.modalTx0 && <Tx0Modal utxos={this.state.modalTx0} onClose={modalService.close.bind(modalService)}/>}
            {this.state.modalDeposit && <DepositModal onClose={modalService.close.bind(modalService)}/>}
            {this.state.modalZpub && <ZpubModal zpub={this.state.modalZpub.zpub} account={this.state.modalZpub.account} onClose={modalService.close.bind(modalService)}/>}

          </main>
        </div>

      </div>
    </div>
  }
}


function mapStateToProps(state) {
  return {
    status: state.status,
    cli: state.cli,
    gui: state.gui,
    wallet: state.wallet,
    mix: state.mix,
    pools: state.pools
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    statusActions: bindActionCreators(statusActions, dispatch),
    cliActions: bindActionCreators(cliActions, dispatch),
    guiActions: bindActionCreators(guiActions, dispatch),
    walletActions: bindActionCreators(walletActions, dispatch),
    poolsActions: bindActionCreators(poolsActions, dispatch),
    mixActions: bindActionCreators(mixActions, dispatch)
  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(App));
