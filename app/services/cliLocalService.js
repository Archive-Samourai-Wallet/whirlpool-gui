import * as React from 'react';
import { ipcRenderer } from 'electron';
import { ProgressBar } from 'react-bootstrap';
import { cliApiService, CLILOCAL_STATUS, IPC_CLILOCAL } from '../const';
import cliService from './cliService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import utils from './utils';

class CliLocalService {
  constructor() {
    this.state = undefined
    ipcRenderer.on(IPC_CLILOCAL.STATE, this.onState.bind(this))
  }

  onState(event, cliLocalState) {
    console.log('cliLocalService.onState', cliLocalState)
    this.state = cliLocalState
    cliService.setCliLocalState(cliLocalState)
  }

  fetchState() {
    console.log('CliLocalService: fetchState')
    ipcRenderer.send(IPC_CLILOCAL.GET_STATE)
  }

  reload() {
    console.log('CliLocalService: reload')
    ipcRenderer.send(IPC_CLILOCAL.RELOAD)
  }

  stop() {
    console.log('CliLocalService: stop')
    ipcRenderer.send(IPC_CLILOCAL.STOP)
  }

  deleteConfig() {
    console.log('CliLocalService: reset local CLI')
    ipcRenderer.send(IPC_CLILOCAL.DELETE_CONFIG)
  }

  isValid() {
    return this.state !== undefined && this.state.valid
  }

  getInfo() {
    return this.state !== undefined && this.state.info
  }

  getError() {
    return this.state !== undefined && this.state.error
  }

  getProgress() {
    return this.state !== undefined && this.state.progress
  }

  isStatusUnknown() {
    return this.state !== undefined && this.state.status === undefined
  }

  isStatusDownloading() {
    return this.state !== undefined && this.state.status === CLILOCAL_STATUS.DOWNLOADING
  }

  isStarted() {
    return this.state !== undefined && this.state.started
  }

  getStartTime() {
    return this.state ? this.state.started : undefined
  }

  isStatusError() {
    return this.state !== undefined && this.state.status === CLILOCAL_STATUS.ERROR
  }

  getStatusIcon(format) {
    let infoError = ""
    if (cliLocalService.getError()) {
      infoError = cliLocalService.getError()+'. '
    }
    if (cliLocalService.getInfo()) {
      infoError += cliLocalService.getInfo()
    }

    // downloading
    if (cliLocalService.isStatusDownloading()) {
      const progress = this.getProgress()
      const status = 'Downloading CLI '+cliLocalService.getCliVersionStr()+'... '+(progress?progress+'%':'')
      const progressBar = progress ? <ProgressBar animated now={progress} label={progress+'%'} title={status}/> : <span></span>
      return format(progressBar, status)
    }
    // error
    if (cliLocalService.isStatusError()) {
      const status = 'Local CLI error: '+infoError
      return format(<FontAwesomeIcon icon={Icons.faCircle} color='red' title={status}/>, status)
    }
    if (cliLocalService.isStarted()) {
      // started
      const status = 'Local CLI was launched '+utils.durationElapsed(cliLocalService.getStartTime())+' ago'
      return format(<FontAwesomeIcon icon={Icons.faPlay} color='green' title={status} size='xs'/>, status)
    }
    if (cliLocalService.isStatusUnknown()) {
      // unknown
      const status = 'Local CLI is initializing. '+infoError
      return format(<FontAwesomeIcon icon={Icons.faCircle} color='red' title={status} size='xs'/>, status)
    }
    if (!cliLocalService.isValid()) {
      // invalid
      const status = 'Local CLI executable is not valid. '+infoError
      return format(<FontAwesomeIcon icon={Icons.faCircle} color='red' title={status} size='xs'/>, status)
    }
    // valid but stopped
    const status = 'Local CLI is not running. '+infoError
    return format(<FontAwesomeIcon icon={Icons.faStop} color='orange' title={status} />, status)
  }

  hasCliApi() {
    return this.state && this.state.cliApi
  }

  getCliVersion() {
    if (!this.hasCliApi()) {
      return undefined
    }
    return this.state.cliApi.cliVersion
  }

  getCliVersionStr() {
    let version = this.getCliVersion() ? this.getCliVersion() : '?'
    if (!cliApiService.isApiModeRelease()) {
      // apiMode
      version += ' ['+cliApiService.getApiMode()+']'

      // checksum
      if (cliApiService.useChecksum()) {
        const checksum = this.getCliChecksum() ? this.getCliChecksum() : '?'
        version += ' (' + checksum + ')'
      }
    }
    return version
  }

  getCliFilename() {
    if (!this.hasCliApi()) {
      return undefined
    }
    return this.state.cliApi.filename
  }

  getCliUrl() {
    if (!this.hasCliApi()) {
      return undefined
    }
    return this.state.cliApi.url
  }

  getCliChecksum() {
    if (!this.hasCliApi()) {
      return undefined
    }
    return this.state.cliApi.checksum
  }
}
export const cliLocalService = new CliLocalService()

