// @flow
import React, { useEffect, useState } from 'react';
import { QrReader } from 'react-qr-reader';
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
            <QrReader
              constraints={{
                aspectRatio: "1",
                facingMode: "environment"
              }}
              scanDelay={250}
              onResult={(result, error) => {
                if (!!result) {
                  console.log('qr: '+result.getText())
                  onScan(result?.text);
                  onClose();
                }
                if (!!error && error.message) {
                  modalUtils.setError('Could not read QR code: ' + error.message)
                }
              }}
              videoContainerStyle={{}}
              videoStyle={{}}
            />
          </div>
        </div>
      </div>
  </GenericModal>
}
