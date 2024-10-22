// @flow
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import cliService from '../services/cliService';
import { CLI_LOG_ERROR_FILE, CLI_LOG_FILE, GUI_CONFIG_FILE, GUI_LOG_FILE, GUI_PATH, GUI_VERSION } from '../const';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import LinkExternal from '../components/Utils/LinkExternal';
import { Card } from 'react-bootstrap';
import utils from '../services/utils';
import guiConfig from '../mainProcess/guiConfig';
import walletService from '../services/walletService';
import { cliApiService } from '../mainProcess/cliApiService';

type Props = {};

export default class StatusPage extends Component<Props> {

  constructor(props) {
    super(props)

    this.onResetConfig = this.onResetConfig.bind(this)
    this.onRestartCli = this.onRestartCli.bind(this)
    this.onResync = this.onResync.bind(this)

    this.cliLogFile = CLI_LOG_FILE
    this.cliLogErrorFile = CLI_LOG_ERROR_FILE
    this.guiLogFile = GUI_LOG_FILE
  }

  onResetConfig() {
    if (confirm('This will reset '+cliService.getResetLabel()+'. Are you sure?')) {
      cliService.resetConfig()
    }
  }

  onRestartCli() {
    if (confirm('This will restart CLI. Are you sure?')) {
      cliService.restart()
    }
  }

  onResync() {
    if (confirm('This will resync postmix counters. Are you sure?')) {
      walletService.resync()
    }
  }

  render() {
    const cliStatusIcon = cliService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)

    return (
      <div>
        <h1>System</h1>

        <div className='row'>
          <div className='col-sm-12'>
            <Card>
              <Card.Header>
                <div className='row'>
                  <div className='col-sm-12'>
                    <div className='float-right text-right'>
                      <button type='button' className='btn btn-danger btn-sm' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset {cliService.getResetLabel()}</button>
                    </div>
                    <strong>GUI</strong>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className='row'>
                  <div className='col-sm-2'>
                    <strong>Version:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div>GUI <strong>{GUI_VERSION}</strong>, API <strong>{cliApiService.getVersionName()}</strong></div>
                  </div>
                </div>
                <div className='row'>
                  <div className='col-sm-2'>
                    <strong>Proxy:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div><strong>{guiConfig.getGuiProxy()||'None'}</strong></div>
                  </div>
                </div>
                <div className='row'>
                  <div className='col-sm-2'>
                    <strong>Mode:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div><strong>{cliService.isConfigured() ? (cliService.isCliLocal()?'Standalone':'Remote CLI') : 'Not configured'}</strong></div>
                  </div>
                </div>
                <div className='row small'>
                  <div className='col-sm-12'>
                    <hr/>
                  </div>
                </div>
                <div className='row small'>
                  <div className='col-sm-2'>
                    <strong>Path:</strong><br/>
                    <strong>Config:</strong><br/>
                    <strong>Logs:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div><LinkExternal href={'file://'+GUI_PATH}>{GUI_PATH}</LinkExternal></div>
                    <div></div><LinkExternal href={'file://'+GUI_CONFIG_FILE}>{GUI_CONFIG_FILE}</LinkExternal><br/>
                    <div><LinkExternal href={'file://'+this.guiLogFile}>{this.guiLogFile}</LinkExternal></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <br/>
          </div>
        </div>

        <Card>
          <Card.Header>
            <div className='row'>
              <div className='col-sm-12'>
                <div className='float-right text-right'>
                  <button type='button' className='btn btn-primary btn-sm' onClick={this.onRestartCli}>Restart CLI</button>{' '}
                  {walletService.isReady() && <button type='button' className='btn btn-secondary btn-sm' onClick={this.onResync}>Resync postmix counters</button>}
                </div>
                <strong>CLI</strong>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className='row'>
              <div className='col-sm-2'>
                <strong>Status:</strong>
              </div>
              <div className='col-sm-10'>
                {cliStatusIcon}
              </div>
            </div>
            {cliService.isConfigured() && !cliService.isCliLocal() && <div>
              <div className='row'>
                <div className='col-sm-2'>
                  <strong>Remote CLI:</strong>
                </div>
                <div className='col-sm-10'>
                  {cliService.getCliUrl()}
                </div>
              </div>
            </div>}
            {cliService.isCliLocal() && <div>
              <div className='row'>
                <div className='col-sm-2'>
                  <strong>Local CLI:</strong>
                </div>
                <div className='col-sm-10'>
                  {cliLocalService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)}
                </div>
              </div>
              {cliLocalService.hasCliApi() && <div className='row'>
                <div className='col-sm-2'>
                  <strong>JAR:<br/></strong>
                </div>
                <div className='col-sm-10'>
                  <div>{cliLocalService.getCliFilename()} ({cliLocalService.getCliChecksum() || 'no checksum'})</div>
                </div>
              </div>}
            </div>}

            {cliService.isConfigured() && cliService.isConnected() && <div>
              <hr/>
              <div className='row'>
                <div className='col-sm-2'>
                  <strong>Version:</strong><br/>
                  <strong>Whirlpool server:</strong><br/>
                  <strong>DOJO:</strong><br/>
                  <strong>Tor:</strong><br/>
                </div>
                <div className='col-sm-10'>
                  <div>{cliService.getVersion()}</div>
                  <div>{cliService.getServerName()}</div>
                  <div>
                    {utils.checkedIcon(cliService.isDojo())} <strong>{cliService.isDojo()?'enabled':'disabled'}</strong>&nbsp;
                    {cliService.isDojo() && <small>{cliService.getDojoUrl()}</small>}
                  </div>
                  <div>{utils.checkedIcon(cliService.isTor())} <strong>{cliService.isTor()?'enabled':'disabled'}</strong></div>
                </div>
              </div>
            </div>}

            {cliService.isCliLocal() && <div>
              <hr/>
              <div className='row small'>
                <div className='col-sm-2'>
                  <strong>Path:</strong><br/>
                  <strong>Config:</strong><br/>
                  <strong>Logs:</strong><br/>
                  <strong>Errors:</strong>
                </div>
                <div className='col-sm-10'>
                  <LinkExternal href={'file://'+cliApiService.getCliPath()}>{cliApiService.getCliPath()}</LinkExternal><br/>
                  <LinkExternal href={'file://'+cliApiService.getCliConfigFile()}>{cliApiService.getCliConfigFile()}</LinkExternal><br/>
                  <LinkExternal href={'file://'+this.cliLogFile}>{this.cliLogFile}</LinkExternal><br/>
                  <LinkExternal href={'file://'+this.cliLogErrorFile}>{this.cliLogErrorFile}</LinkExternal>
                </div>
              </div>
            </div>}

          </Card.Body>
        </Card>
        <br/>

        <br/><br/>
      </div>
    );
  }
}
