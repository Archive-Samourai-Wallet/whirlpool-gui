// @flow
import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';

export default function GenericModal(props) {
  const {dialogClassName, modalUtils, title, buttons, onClose} = props

  return (
    <Modal show={true} onHide={onClose} dialogClassName={dialogClassName}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.children}
      </Modal.Body>
      <Modal.Footer>
        {modalUtils.isLoading() && <div className="modal-status">
          <div className="spinner-border spinner-border-sm" role="status"/> {modalUtils.getLoadingMessage()}
        </div>}
        {!modalUtils.isLoading() && modalUtils.isError() && <div className="modal-status">
          <Alert variant='danger'>{modalUtils.error}</Alert>
        </div>}
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {!modalUtils.isLoading() && !modalUtils.isError() && buttons}
      </Modal.Footer>
    </Modal>
  );
}
