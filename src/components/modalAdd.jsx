import React from 'react';
import {Popover, Tooltip, Button, Modal, OverlayTrigger } from 'react-bootstrap';
import NewItemForm from './newItemForm';

export default class ModalAdd extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      show: false
    };
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  render() {
    const popover = (
      <Popover id="modal-popover" title="popover">
        very popover. such engagement
      </Popover>
    );
    const tooltip = <Tooltip id="modal-tooltip">wow.</Tooltip>;

    return (
      <div>
        <p>Click to get the full Modal experience!</p>

        <Button bsStyle="primary" bsSize="large" onClick={this.handleShow}>
          Launch demo modal
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Submit New Job</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <NewItemForm
              contract={this.props.contract}
              account={this.props.account}
              />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
