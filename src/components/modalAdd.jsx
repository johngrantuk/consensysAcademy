import React from 'react';
import {Button, Modal } from 'react-bootstrap';
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

    return (
      <div>
        <Button bsStyle="primary" bsSize="large" onClick={this.handleShow}>
          SUBMIT NEW PIC
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>What Is It?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <NewItemForm
              contract={this.props.contract}
              account={this.props.account}
              web3={this.props.web3}
              />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
