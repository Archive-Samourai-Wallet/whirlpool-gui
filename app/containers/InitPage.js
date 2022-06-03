// @flow
import React, { Component } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import WebcamPayloadModal from '../components/Modals/WebcamPayloadModal';
import cliService from '../services/cliService';
import { DEFAULT_CLIPORT, IPC_CAMERA } from '../const';
import { cliLocalService } from '../services/cliLocalService';
import utils from '../services/utils';
import guiConfig from '../mainProcess/guiConfig';
import { logger } from '../utils/logger';

const STEP_LAST = 3
const DEFAULT_CLIHOSTPORT = 'https://my-cli-host:'+DEFAULT_CLIPORT
const TOR_CLIHISTPORT = 'http://my-hiddenservice.onion:'+DEFAULT_CLIPORT
const DEFAULT_APIKEY = ''
const DEFAULT_GUI_PROXY = 'socks5://127.0.0.1:9050'
const TORBROWSER_PROXY = 'socks5://127.0.0.1:9150'

const CLILOCAL_URL = 'https://localhost:'+DEFAULT_CLIPORT
class InitPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.state = {
      step: 0,
      navNextStep: false,
      cliLocal: cliService.isCliLocal(),
      cliUrl: undefined,
      currentCliHostPort: undefined,
      currentApiKey: DEFAULT_APIKEY,
      showGuiProxy: false,
      showApiKey: false,
      cliError: undefined,
      hasPairingPayload: false,
      hasPairingDojo: false,
      dojo: false,
      tor: false,
      pairingPayload: '',
      pairingError: undefined,
      cliInitError: undefined,
      cameraError: null,
      pairingModal: false,
      cameraAccessGranted: false,
      cliTestRequesting: false,
    }

    // configuration data
    this.hasPairingPayload = undefined

    this.inputCliHostPort = React.createRef()
    this.inputApiKey = React.createRef()

    this.goNextStep = this.goNextStep.bind(this)
    this.goPrevStep = this.goPrevStep.bind(this)
    this.onChangeCliLocal = this.onChangeCliLocal.bind(this)
    this.onChangeInputCliHostPort = this.onChangeInputCliHostPort.bind(this)
    this.connectCli = this.connectCli.bind(this)
    this.onChangePairingPayload = this.onChangePairingPayload.bind(this)
    this.onChangeTor = this.onChangeTor.bind(this)
    this.onChangeDojo = this.onChangeDojo.bind(this)
    this.onChangeGuiProxy = this.onChangeGuiProxy.bind(this)
    this.onSubmitInitialize = this.onSubmitInitialize.bind(this)
  }

  componentDidMount() {
    ipcRenderer.on(IPC_CAMERA.GRANTED, () => {
      this.setState({ cameraAccessGranted: true })
    });
    ipcRenderer.on(IPC_CAMERA.DENIED, () => {
      this.setState({ cameraAccessGranted: false, pairingModal: false, cameraError: "Camera access was denied or is unavailable." })
    });
  }

  openPairingModal = () => {
    ipcRenderer.send(IPC_CAMERA.REQUEST);
    this.setState({ pairingModal: true });
  };

  closePairingModal = () => {
    this.setState({ pairingModal: false });
  };

  goNextStep () {
    this.goStep(this.state.step+1)
  }

  goPrevStep () {
    this.goStep(this.state.step-1)
  }

  goStep (i) {
    this.setState({step: i})
  }

  navButtons(next=true,previous=true) {
    this.navNextStep = next

    return <div className="form-group row">
      <div className="col-sm-5">
        {previous && this.state.step > 0 && <button type="button" className="btn btn-default" onClick={this.goPrevStep}><FontAwesomeIcon icon={Icons.faArrowLeft} /></button>}
      </div>
      <div className="col-sm-5">
        {next && <button type="submit" className="btn btn-primary"> Continue <FontAwesomeIcon icon={Icons.faArrowRight} /></button>}
      </div>
    </div>
  }

  render() {
    return (
      <div>
        <h1>Whirlpool setup</h1>

        <p>This will connect Whirlpool to Samourai Wallet.</p>

        {this.state.cliUrl && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Connected to whirlpool-cli: <strong>{this.state.cliLocal ? 'standalone' : this.state.cliUrl}</strong></div>}
        {this.state.hasPairingPayload && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Pairing with Samourai Wallet</div>}
        {this.state.step === STEP_LAST && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Configuration saved</div>}
        <br/>

        <form onSubmit={(e) => {
          if (this.navNextStep) {
            this.goNextStep();
          }
          e.preventDefault()
        }}>

        {this.state.step === 0 && this.step0()}
        {this.state.step === 1 && this.step1()}
        {this.state.step === 2 && this.step2()}
        {this.state.step === STEP_LAST && this.step3()}
        </form>
        {this.state.pairingModal && this.state.cameraAccessGranted && (
          <WebcamPayloadModal onClose={this.closePairingModal} onScan={(value) => this.onChangePairingPayload(value)} />
        )}
      </div>
    );
  }

  // cli instance selection

  onChangeCliLocal(e) {
    const valueBool = e.target.value === 'true'
    cliService.setCliLocal(valueBool)
    this.setState({
      cliLocal: valueBool
    });
    this.resetCliUrl()
  }

  resetCliUrl(resetToggles=true) {
    const newState = {
      cliUrl: undefined,
      cliError: undefined,
      currentCliHostPort: undefined,
      currentApiKey: DEFAULT_APIKEY
    }
    if (resetToggles) {
      newState.showApiKey = false
      newState.showGuiProxy = false
    }
    this.setState(newState);
    this.resetPairingPayload()
  }

  onChangeInputCliHostPort(e) {
    this.resetCliUrl(false)
    const cliHostPort = this.inputCliHostPort.current ? this.inputCliHostPort.current.value : undefined
    const apiKey = this.inputApiKey.current ? this.inputApiKey.current.value : undefined

    const newState = {
      currentCliHostPort: cliHostPort,
      currentApiKey: apiKey
    }
    const isHiddenService = cliHostPort && cliHostPort.indexOf('.onion')!==-1
    if (isHiddenService) {
      newState.showGuiProxy = isHiddenService
      if (!guiConfig.getGuiProxy()) {
        // set default GUI proxy
        guiConfig.setGuiProxy(DEFAULT_GUI_PROXY)
      }
    }
    this.setState(newState)
  }

  computeCliUrl() {
    let cliUrl = (this.state.cliLocal ? CLILOCAL_URL:this.state.currentCliHostPort)

    // remove ending '/' causing connection failure
    if (cliUrl.substr(-1,1) === '/') {
      cliUrl = cliUrl.substr(0, cliUrl.length-1);
    }

    const isHiddenService = cliUrl.indexOf('.onion')!==-1
    if (isHiddenService) {
      // adapt url for hidden service
      const spl = cliUrl.split('://')
      const protocol = spl[0]

      // https://onion -> http://onion
      if (spl.length >= 2 && protocol !== 'http') {
        console.log('replacing http protocol for onion')
        cliUrl = 'http://' + spl[1]
      }
      // onion -> http://onion
      else if (spl.length == 1) {
        console.log('adding http protocol for onion')
        cliUrl = 'http://' + spl[0]
      }
    }
    console.log('computeCliUrl', cliUrl)
    return cliUrl
  }

  connectCli() {
    const cliUrl = this.computeCliUrl()
    const apiKey = this.state.currentApiKey
    const cliLocal = this.state.cliLocal

    this.setState({cliTestRequesting: true})

    cliService.testCliUrl(cliUrl, apiKey).then(cliStatusReady => {
      // connection success
      this.setState({
        cliUrl: cliUrl,
        cliError: undefined
      })

      if (cliStatusReady) {
        // CLI already initialized => save configuration & finish
        cliService.saveConfig(cliUrl, apiKey, cliLocal)
        this.goStep(STEP_LAST)
      }
      else {
        // CLI not initialized yet => continue configuration
        this.goNextStep()
      }
    }).catch(error => {
      this.setState({cliTestRequesting: false})
      if (error && error.message.indexOf('API Key')) {
        this.setState({showApiKey:true})
      }
      logger.error('testCliUrl failed',error)
      this.setState({
        cliError: error.message
      })
    })
  }

  step0() {
    return <div>
      <div className="form-group row">
        <div className="col-sm-12">
          How do you want to use this GUI?
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="inputEmail3" className="col-sm-1 col-form-label"></label>
        <div className="col-sm-11">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="cliLocal" id="cliLocalTrue" value='true' checked={this.state.cliLocal} onChange={this.onChangeCliLocal}/>
            <label className="form-check-label" htmlFor="cliLocalTrue">
              <strong>Standard: standalone GUI</strong>
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="cliLocal" id="cliLocalFalse" value='false' checked={!this.state.cliLocal} onChange={this.onChangeCliLocal} />
            <label className="form-check-label" htmlFor="cliLocalFalse">
              <strong>Advanced: remote CLI</strong>
            </label>
          </div>
        </div>
      </div>

      {this.state.cliLocal && <div>
        <div className="row">
          <div className="col-sm-1"></div>
          {cliLocalService.getStatusIcon((icon,text)=><div className='col-sm-8'><Alert variant='success'>{icon} {text}</Alert></div>)}
          {!cliLocalService.isStatusDownloading() && !cliLocalService.isValid() && <div className='col-sm-12'><Alert variant='danger'>No valid CLI found. Please reinstall GUI.</Alert></div>}
        </div>
        {cliLocalService.isValid() && <div className="row">
          <div className="col-sm-3"></div>
          <button type="button" className="btn btn-primary col-sm-3" onClick={this.connectCli}> Continue <FontAwesomeIcon icon={Icons.faArrowRight} /></button>
        </div>}
      </div>}

      {!this.state.cliLocal &&
      <Card>
        <Card.Header>Remote CLI</Card.Header>
        <Card.Body>
          <div className="form-group row">
            <div className="col-sm-11">
              <div className="row">
                <label htmlFor="cliHostPort" className="col-sm-2 col-form-label">CLI address</label>
                <input type="text" id="cliHostPort" className="form-control col-sm-4" placeholder={DEFAULT_CLIHOSTPORT} ref={this.inputCliHostPort} onChange={this.onChangeInputCliHostPort} required/>
                <label className='col-form-label col-sm-6 text-muted' style={{'padding-top':0,'padding-bottom':0}}>
                  <code>{DEFAULT_CLIHOSTPORT}</code> for standard usage<br/>
                  <code>{TOR_CLIHISTPORT}</code> for Hidden Service
                </label>
              </div>

              {this.state.showGuiProxy && <hr />}
              <div className="row">
                {this.state.showGuiProxy && <>
                  <label htmlFor="guiProxy" className="col-sm-2 col-form-label">Tor proxy</label>
                  <input type="text"
                    id="guiProxy"
                    className="form-control col-sm-4"
                    placeholder={DEFAULT_GUI_PROXY}
                    defaultValue={guiConfig.getGuiProxy()}
                    onChange={this.onChangeGuiProxy}/>
                  <label className='col-form-label col-sm-6 text-muted' style={{'padding-top':0}}>
                    Required when CLI is behind a Hidden Service.<br/>
                    <code>{DEFAULT_GUI_PROXY}</code> with Tor,<br/><code>{TORBROWSER_PROXY}</code> with Tor Browser
                  </label>
                </>}
              </div>

              {this.state.showApiKey && <hr />}
              <div className="row">
                {this.state.showApiKey && <>
                  <label htmlFor="apiKey" className="col-sm-2 col-form-label">API Key</label>
                  <input type="password" id="apiKey" className="form-control col-sm-4" defaultValue={this.state.currentApiKey} ref={this.inputApiKey} onChange={this.onChangeInputCliHostPort} />
                  <label className='col-form-label col-sm-6 text-muted' style={{'padding-top':0}}>
                    Required when CLI was already initialized<br/>(<code>cli.apiKey</code> in <code>whirlpool-cli-config.properties</code>)
                  </label>
                </>}
              </div>

              {(!this.state.showGuiProxy || !this.state.showApiKey) &&
                <div className="row">
                    <div className="col-sm-3 col-form-label">
                    {!this.state.showGuiProxy &&
                      <a onClick={() => this.setState({showGuiProxy:true})}>Use a Tor proxy?</a>}
                    </div>
                    <div className="col-sm-3 col-form-label text-right">
                    {!this.state.showApiKey &&
                      <a onClick={() => this.setState({showApiKey:true})}>Configure API key?</a>}
                    </div>
                </div>
              }

              <hr />
              <div className="row">
                <button type='button'
                  className='btn btn-primary col-sm-4 offset-sm-2'
                  disabled={!this.state.currentCliHostPort || this.state.cliUrl || this.state.cliTestRequesting}
                  onClick={this.connectCli}>
                    {this.state.cliTestRequesting ? 'Loading' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      }
      {this.state.cliError && <div className="row">
        <div className="col-sm-12"><br/>
          <Alert variant='danger'>Connection failed: {this.state.cliError}</Alert>
        </div>
      </div>}
      {this.navButtons(false)}
    </div>
  }

  // pairing

  resetPairingPayload() {
    this.setState({
      pairingPayload: '',
      hasPairingPayload: false,
      pairingError: undefined,
      cliInitError: undefined
    })
  }

  onChangePairingPayload(payloadStr) {
    if (payloadStr) {
      payloadStr = payloadStr.trim()
    }
    this.setState({ pairingPayload: payloadStr });

    let payload = undefined
    try {
      payload = JSON.parse(payloadStr)
    } catch(e) {}
    if (payload && payload.pairing && Object.keys(payload.pairing).length > 0) {
      const isDojo = payload.dojo && Object.keys(payload.dojo).length > 0

      // seems valid
      this.setState({
        hasPairingPayload: true,
        hasPairingDojo: isDojo,
        dojo: isDojo,
        tor: isDojo,
        pairingError: undefined
      })
      this.goNextStep()
    } else {
      // invalid payload
      logger.error('Invalid payload: '+payloadStr)
      this.setState({
        hasPairingPayload: false,
        hasPairingDojo: false,
        dojo: false,
        tor: false,
        pairingError: 'Invalid payload'
      })
    }
  }

  onChangeTor(tor) {
    this.setState({
      tor: tor
    })
  }

  onChangeDojo(value) {
    this.setState({
      dojo: value
    })
  }

  onChangeGuiProxy(e) {
    const value = e.target.value
    guiConfig.setGuiProxy(value)
  }

  onSubmitInitialize() {
    cliService.initializeCli(this.state.cliUrl, this.state.currentApiKey, this.state.cliLocal, this.state.pairingPayload, this.state.tor, this.state.dojo).then(() => {
      // success!
      this.goNextStep()
    }).catch(error => {
      logger.error('initialization failed', error)
      this.setState({
        cliInitError: error.message
      })
    })
  }

  step1() {
    return <div>
      <div className="form-group row">
        <div className="col-sm-1 text-right">
          <FontAwesomeIcon icon={Icons.faMobileAlt} size='6x'/>
        </div>
        <div className="col-sm-11">
          <div className="row">
            <div className="col-sm-12">
              Get your <strong>pairing payload</strong> from Samourai Wallet, go
              to <strong>Settings/Transactions/Experimental</strong> then{' '}
              <a onClick={(event) => {
                event.preventDefault();
                this.openPairingModal();
              }} href="#"><strong>scan it using webcam</strong></a>.<br/>
              <br/>
              <div className="row">
                <div className="col-sm-10">
                  <input type="text" className='form-control form-control-lg' required autoFocus onChange={e => {
                    this.onChangePairingPayload(e.target.value)
                  }} onClick={e => {
                    e.target.value = ''
                    this.resetPairingPayload()
                  }} value={this.state.pairingPayload} id="pairingPayload"
                         placeholder='Scan or paste your pairing payload here'/>
                </div>
                <div className="col-sm-2 text-left">
                  <a title="Scan your pairing payload using webcam" onClick={(event) => {
                    event.preventDefault();
                    this.openPairingModal();
                  }} href="#"><FontAwesomeIcon icon={Icons.faQrcode} size='3x'/></a>
                </div>
              </div>
            </div>
          </div>
          {this.state.pairingError && <div className="col-sm-12"><br/>
            <Alert variant='danger'>{this.state.pairingError}</Alert>
          </div>}
          {this.state.cameraError && <div className="col-sm-12"><br/>
            <Alert variant='danger'>{this.state.cameraError}</Alert>
          </div>}
        </div>
      </div>
      {this.navButtons(this.state.pairingPayload && !this.state.pairingError)}
    </div>
  }

  step2() {
    const checked = e => {
      return e.target.checked
    }
    const myThis = this
    return <div>
      <div className="row">
        <div className="col-sm-1 text-center">
          {utils.torIcon('100%')}
        </div>
        <div className="col-sm-4">
          {this.state.hasPairingDojo && <div>
            <div className='custom-control custom-switch'>
              <input type="checkbox" className="custom-control-input" onChange={e => myThis.onChangeDojo(checked(e))} defaultChecked={myThis.state.dojo} id="dojo"/>
              <label className="custom-control-label" htmlFor="dojo">Use Dojo as wallet backend <FontAwesomeIcon icon={Icons.faHdd}/></label>
            </div>
            {this.state.dojo && <div>
              <div className='custom-control custom-switch'>
                <input type="checkbox" className="custom-control-input" defaultChecked={true} id="torDojo" disabled/>
                <label className="custom-control-label" htmlFor="torDojo">Tor is required for Dojo</label>
              </div>
            </div>}
          </div>}
          {!this.state.dojo && <div className='custom-control custom-switch'>
            <input type="checkbox" className="custom-control-input" onChange={e => myThis.onChangeTor(checked(e))} defaultChecked={myThis.state.tor} id="tor"/>
            <label className="custom-control-label" htmlFor="tor">Enable Tor</label>
          </div>}
        </div>
        <div className="col-sm-7">
          <button type="button" className="btn btn-primary btn-lg" onClick={this.onSubmitInitialize}>Initialize GUI</button>
        </div>
      </div>
      {this.state.cliInitError && <div className="row">
        <div className="col-sm-12">
          <Alert variant='danger'>Initialization failed: {this.state.cliInitError}</Alert>
        </div>
      </div>}
      {this.navButtons(false)}
    </div>
  }

  step3() {
    return <div>
      Restarting...
    </div>
  }
}
function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InitPage);
