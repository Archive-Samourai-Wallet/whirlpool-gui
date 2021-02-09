// @flow
import React, { Component } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { logger } from '../utils/logger';
import { CliConfigService } from '../services/cliConfigService';
import cliService from '../services/cliService';

type Props = {};

const SERVER_MAIN = 'MAINNET'
export default class ConfigPage extends Component<Props> {

  constructor(props) {
    super(props)

    this.state = {
      info: undefined,
      error: undefined,
      cliConfig: undefined,
      showDevelopersConfig: false,
    }

    this.cliConfigService = new CliConfigService(cliConfig => this.setState({
      cliConfig: cliConfig
    }))

    this.onResetConfig = this.onResetConfig.bind(this)
    this.onChangeCliConfig = this.onChangeCliConfig.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.toogleDevelopersConfig = this.toogleDevelopersConfig.bind(this)
  }

  onResetConfig() {
    if (confirm('This will reset '+cliService.getResetLabel()+'. Are you sure?')) {
      cliService.resetConfig()
    }
  }

  onChangeCliConfig(set) {
    const cliConfig = this.state.cliConfig
    set(this.state.cliConfig)

    this.setState({
      cliConfig: cliConfig
    })
  }

  onSubmit(e) {
    this.cliConfigService.save(this.state.cliConfig).then(() => {
      logger.info('Configuration updated')
      this.setState({
        info: 'Configuration saved',
        error: undefined
      })
    }).catch(e => {
      logger.error('', e)
      this.setState({
        info: undefined,
        error: e.message
      })
    })
  }

  toogleDevelopersConfig() {
    this.setState({
      showDevelopersConfig: !this.state.showDevelopersConfig
    })
  }

  render() {
    if (!this.state.cliConfig) {
      return <small>Loading configuration...</small>
    }
    const cliConfig = this.state.cliConfig
    if (!cliConfig.mix) {
      cliConfig.mix = {}
    }
    const myThis = this
    const checked = e => {
      return e.target.checked
    }
    const isTestnet = cliConfig.server !== SERVER_MAIN
    return (
      <div>
        <h1>Configuration</h1>

        <form onSubmit={(e) => {this.onSubmit(e);e.preventDefault()}}>
          <div className="form-group row">
            <div className="col-sm-12">
              {this.state.error && <Alert variant='danger'>{this.state.error}</Alert>}
              {this.state.info && <Alert variant='success'>{this.state.info}</Alert>}
            </div>
          </div>

          <Card>
            <Card.Header>General configuration</Card.Header>
            <Card.Body>
              <div className="form-group row">
                <label htmlFor="autoMix" className="col-sm-2 col-form-label">Auto-MIX</label>
                <div className="col-sm-10 custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" onChange={e => myThis.onChangeCliConfig(cliConfig => cliConfig.mix.autoMix = checked(e))} defaultChecked={cliConfig.mix.autoMix} id="autoMix"/>
                  <label className="custom-control-label" htmlFor="autoMix">Automatically mix premix & postmix</label>
                </div>
              </div>

              {cliService.isDojoPossible() && <div className="form-group row">
                <label htmlFor="dojo" className="col-sm-2 col-form-label">DOJO</label>
                <div className="col-sm-10 custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" onChange={e => myThis.onChangeCliConfig(cliConfig => {
                    cliConfig.dojo = checked(e)
                    if (cliConfig.dojo) {
                      cliConfig.tor = true
                    }
                  })} defaultChecked={cliConfig.dojo} id="dojo"/>
                  <label className="custom-control-label" htmlFor="dojo">Enable DOJO <small>- {cliService.getDojoUrl()}</small></label>
                </div>
              </div>}

              <div className="form-group row">
                <label htmlFor="tor" className="col-sm-2 col-form-label">Tor</label>
                {!cliConfig.dojo && <div className="col-sm-10 custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" onChange={e => myThis.onChangeCliConfig(cliConfig => cliConfig.tor = checked(e))} defaultChecked={cliConfig.tor} id="tor"/>
                  <label className="custom-control-label" htmlFor="tor">Enable Tor</label>
                </div>}
                {cliConfig.dojo && <div className="col-sm-10">
                  DOJO+Tor enabled <FontAwesomeIcon icon={Icons.faCheck} color='green' />
                </div>}
              </div>

              <div className="form-group row">
                <label htmlFor="scode" className="col-sm-2 col-form-label">SCODE</label>
                  <input type="text" className='form-control col-sm-3' onChange={e => {
                    const myValue = e.target.value
                    myThis.onChangeCliConfig(cliConfig => cliConfig.scode = myValue)
                  }} defaultValue={cliConfig.scode} id="scode"/>
                  <label className='col-form-label col-sm-5 text-muted'>A Samourai Discount Code for reduced-cost mixing.</label>
              </div>
            </Card.Body>
          </Card>

          <br/>

          <Card>
            <Card.Header>Advanced settings</Card.Header>
            <Card.Body>
              <div className="form-group row">
                <label htmlFor="tx0MaxOutputs" className="col-sm-2 col-form-label">TX0 max outputs</label>
                <input type="number" className='form-control col-sm-3' onChange={e => {
                  const myValue = parseInt(e.target.value)
                  myThis.onChangeCliConfig(cliConfig => cliConfig.mix.tx0MaxOutputs = myValue)
                }} defaultValue={cliConfig.mix.tx0MaxOutputs} id="tx0MaxOutputs"/>
                <label className='col-form-label col-sm-5 text-muted'>Max premixes per TX0 (0 = max limit)</label>
              </div>

              <div className="form-group row">
                <label htmlFor="proxy" className="col-sm-2 col-form-label">CLI proxy</label>
                <input type="text" className='form-control col-sm-3' onChange={e => {
                  const myValue = e.target.value
                  myThis.onChangeCliConfig(cliConfig => cliConfig.proxy = myValue)
                }} defaultValue={cliConfig.proxy} id="proxy"/>
                <label className='col-form-label col-sm-7 text-muted'>
                  Set it only when blocked by a firewall (this is not <i>GUI Tor proxy</i>).<br/>
                  <code>socks://host:port</code> or <code>http://host:port</code>
                </label>
              </div>
            </Card.Body>
          </Card>

          <br/>

          <Card>
            <Card.Header><a onClick={this.toogleDevelopersConfig} style={{cursor:'pointer'}}>Developers settings</a></Card.Header>
            {this.state.showDevelopersConfig && <Card.Body>

              <div className="form-group row">
                <label htmlFor="clientDelay" className="col-sm-2 col-form-label">Client delay</label>
                <input type="number" className='form-control col-sm-3' onChange={e => {
                  const myValue = parseInt(e.target.value)
                  myThis.onChangeCliConfig(cliConfig => cliConfig.mix.clientDelay = myValue)
                }} defaultValue={cliConfig.mix.clientDelay} id="clientDelay"/>
                <label className='col-form-label col-sm-5 text-muted'>Delay (in seconds) between each client connection</label>
              </div>

              {isTestnet && <div className="form-group row">
                <label htmlFor="clientsPerPool" className="col-sm-2 col-form-label">Max clients per pool</label>
                <input type="number" className='form-control col-sm-3' onChange={e => {
                  const myValue = parseInt(e.target.value)
                  myThis.onChangeCliConfig(cliConfig => cliConfig.mix.clientsPerPool = myValue)
                }} defaultValue={cliConfig.mix.clientsPerPool} id="clientsPerPool"/>
                <label className='col-form-label col-sm-5 text-muted'>Max simultaneous mixing clients per pool</label>
              </div>}

              <div className="form-group row">
                <label htmlFor="tx0FakeOutputRandomFactor" className="col-sm-2 col-form-label">TX0 obfuscation</label>
                <input type="number" className='form-control col-sm-3' onChange={e => {
                  const myValue = parseInt(e.target.value)
                  myThis.onChangeCliConfig(cliConfig => cliConfig.mix.tx0FakeOutputRandomFactor = myValue)
                }} defaultValue={cliConfig.mix.tx0FakeOutputRandomFactor} id="tx0FakeOutputRandomFactor" disabled={!isTestnet}/>
                <label className='col-form-label col-sm-5 text-muted'><strong>Experimental</strong> (testnet only) TX0 fake output (0 = never, 1 = always).</label>
              </div>

              <div className="form-group row">
                <label htmlFor="tx0FakeOutputMinValue" className="col-sm-2 col-form-label">TX0 min change</label>
                <input type="number" className='form-control col-sm-3' onChange={e => {
                  const myValue = parseInt(e.target.value)
                  myThis.onChangeCliConfig(cliConfig => cliConfig.mix.tx0FakeOutputMinValue = myValue)
                }} defaultValue={cliConfig.mix.tx0FakeOutputMinValue} id="tx0FakeOutputMinValue" disabled={!isTestnet}/>
                <label className='col-form-label col-sm-5 text-muted'><strong>Experimental</strong> (testnet only) minimum value per fake change output</label>
              </div>

            </Card.Body>}
          </Card>
          <br/>

          <div className="form-group row">
            <div className="col-sm-5">
              <button type='button' className='btn btn-danger btn-sm' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset {cliService.getResetLabel()}</button>
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn btn-primary">Save &amp; restart</button>
            </div>
          </div>
        </form>
        <br/><br/><br/><br/><br/>
      </div>
    );
  }
}
