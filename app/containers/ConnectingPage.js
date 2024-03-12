// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cliService from '../services/cliService';
import { Alert } from 'react-bootstrap';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { cliLocalService } from '../services/cliLocalService';
import cyclone from '../img/cyclone.png'
import guiConfig from '../mainProcess/guiConfig';

class ConnectingPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.reconnect = this.reconnect.bind(this)
    this.onRestartCli = this.onRestartCli.bind(this)
    this.onResetConfig = this.onResetConfig.bind(this)
  }

  render() {
    if (cliService.isStarting()) {
      return this.renderStarting();
    }

    const cliUrlError = cliService.getCliUrlError() // or undefined
    return this.renderConnecting(cliUrlError)
  }

  // connecting

  reconnect() {
    cliService.fetchState()
  }

  onRestartCli() {
    if (confirm('This will restart CLI. Are you sure?')) {
      cliService.restart()
    }
  }

  onReloadCliLocal() {
    if (confirm('This will reload CLI. Are you sure?')) {
      cliService.reloadCliLocal()
    }
  }

  renderStarting() {
    return (
      <form className="form-signin text-center" onSubmit={(e) => {this.onSubmit();e.preventDefault()}}>
        <h1 className="h3 mb-3 font-weight-normal">Starting Whirlpool...</h1>
        <div><img src={cyclone} className='whirl'/></div><br/>
        <div>whirlpool-cli @ <strong>{cliService.isCliLocal() ? 'standalone GUI' : cliService.getCliUrl()}</strong>
          {guiConfig.getGuiProxy() && <div> via <strong>{guiConfig.getGuiProxy()}</strong></div>}
        </div>
      </form>
    );
  }

  renderConnecting(cliUrlError) {
    return (
      <form className="form-signin text-center" onSubmit={(e) => {this.onSubmit();e.preventDefault()}}>
        <h1 className="h3 mb-3 font-weight-normal">{cliService.getStatusIcon((icon,status)=><span>{status}</span>)}</h1>
        <div className='opacityOnOff'><FontAwesomeIcon icon={Icons.faCloud} size='3x' color='#343a40'/></div><br/>
        <div>whirlpool-cli @ <strong>{cliService.isCliLocal() ? 'standalone GUI' : cliService.getCliUrl()}</strong>
          {guiConfig.getGuiProxy() && <div> via <strong>{guiConfig.getGuiProxy()}</strong></div>}
        </div>
        <br/>
        {cliService.isCliLocal() && <div>
          {cliLocalService.getStatusIcon((icon,text)=><span>{icon} {text}</span>)}<br/>
        </div>}
        <br/>

        {cliService.getCliMessage() && <Alert variant='info'>{cliService.getCliMessage()}</Alert>}
        {!cliService.isConnected() && <button type='button' className='btn btn-primary' onClick={this.reconnect}><FontAwesomeIcon icon={Icons.faSync} /> Retry to connect</button>}{' '}
        {!cliService.isConnected() && cliService.isCliLocal() && <button type='button' className='btn btn-danger' onClick={this.onReloadCliLocal}>Reload CLI</button>}
        {cliService.isConnected() && <button type='button' className='btn btn-danger' onClick={this.onRestartCli}>Restart CLI</button>}

        {cliUrlError && <div>
          <br/>
          <Alert variant='danger'>Connection failed: {cliUrlError}</Alert>
          <br/><br/><br/><br/>
          <p>You may want to reset GUI settings.</p>
          <div className='text-center'>
            <button type='button' className='btn btn-danger btn-sm' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset {cliService.getResetLabel()}</button>
          </div>
        </div>}
      </form>
    );
  }

  // connection failed

  onResetConfig() {
    if (confirm('This will reset '+cliService.getResetLabel()+'. Are you sure?')) {
      cliService.resetConfig()
    }
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
)(ConnectingPage);
