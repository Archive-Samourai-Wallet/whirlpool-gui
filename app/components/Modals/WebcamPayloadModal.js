// @flow
import React, { useEffect, useState } from 'react';
import {QrScanner} from '@yudiel/react-qr-scanner';
import ModalUtils from '../../services/modalUtils';
import GenericModal from './GenericModal';

export default function WebcamPayloadModal(props) {
  const modalUtils = new ModalUtils(useState, useEffect)
  const {onScan, onClose} = props

  return <GenericModal dialogClassName='modal-webcam-payload'
                       modalUtils={modalUtils}
                       title='Scan your pairing payload'
                       buttons={<span/>}
                       onClose={onClose}>
      <div className="row">
        <div className="col-sm-12">
          Get your <strong>Whirlpool pairing payload</strong> from Samourai Wallet. Navigate to: <strong>Settings &gt; Transactions &gt; Pair to Whirlpool GUI</strong>
          <div className="text-center pt-4">
            <QrScanner
              onDecode={(result) => {
                console.log('qr: '+result)
                onScan(result);
                onClose();
              }}
              onError={(error) => {
                modalUtils.setError('Could not read QR code: ' + error.message)
              }}
            />
          </div>
        </div>
      </div>
  </GenericModal>
}
