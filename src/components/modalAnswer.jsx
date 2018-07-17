import React from 'react';
import {Button, Modal } from 'react-bootstrap';
import NewAnswerForm from './newAnswerForm';
const itemHelper = require('../libs/itemHelper');

export default class ModalAnswer extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      show: false,
      answers: [],
    };
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.loadAnswers();
    this.setState({ show: true });
  }

  async loadAnswers(){                                                                                    // Called from constructor to load all holes from colony
    console.log('loadAnswers()')
    const answers = await itemHelper.getItemAnswers(this.props.contract, this.props.account, this.props.itemNo);
    console.log(answers)
    this.setState({
      answers: answers
    });
  }

  render() {

    return (
      <div>
        <hr></hr>
        <Button bsStyle="primary" onClick={this.handleShow}>
          DETAILS
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Item Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <NewAnswerForm
              contract={this.props.contract}
              account={this.props.account}
              itemNo={this.props.itemNo}
              noAnswers={this.props.noAnswers}
              itemInfo={this.props.itemInfo}
              answers={this.state.answers}
              />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
