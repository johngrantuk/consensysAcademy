import React from 'react';
import {Button, Modal } from 'react-bootstrap';
import NewAnswerForm from './newAnswerForm';
const itemHelper = require('../libs/itemHelper');

export default class ModalAnswer extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleBountyCollection = this.handleBountyCollection.bind(this);

    this.state = {
      show: false,
      answers: [],
      answerInfo: ''
    };
  }
  componentWillMount() {
    if(this.props.itemInfo.finalised){
      this.loadAcceptedAnswer();
    }
  }

  async loadAcceptedAnswer() {
    const answerInfo = await itemHelper.getItemAnswer(this.props.contract, this.props.account, this.props.itemNo);
    console.log(answerInfo)
    this.setState({answerInfo: answerInfo});
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.loadAnswers();
    this.setState({ show: true });
  }

  async CollectBounty() {
    await await this.props.contract.claimBounty.sendTransaction(this.props.itemNo, {from: this.props.account});
    console.log('Bounty Claimed')
  }

  handleBountyCollection() {
    this.CollectBounty();
  }

  async loadAnswers(){                                                                                    // Called from constructor to load all holes from colony
    const answers = await itemHelper.getItemAnswers(this.props.contract, this.props.account, this.props.itemNo);
    this.setState({
      answers: answers
    });
  }

  render() {

    const isAnswered = this.props.itemInfo.finalised;
    let status;

    if(isAnswered){
      if(this.props.itemInfo.isBountyCollected){
        status =
        <div>
        <h4>ANSWERED</h4>
        <strong>{this.state.answerInfo.uportName}</strong><br/>
        <strong>{this.state.answerInfo.answer}</strong><br/>
        <strong>{this.state.answerInfo.date}</strong>
        </div>
      }else{
        if(this.props.account === this.state.answerInfo.owner){
          status =
          <div>
          <h4>ANSWERED</h4>
          <strong>{this.state.answerInfo.uportName}</strong><br/>
          <strong>{this.state.answerInfo.answer}</strong><br/>
          <strong>{this.state.answerInfo.date}</strong><br/>
          <Button bsStyle="primary" onClick={this.handleBountyCollection}>COLLECT BOUNTY</Button>
          </div>
        }else{
          status =
          <div>
          <h4>ANSWERED</h4>
          <strong>{this.state.answerInfo.uportName}</strong><br/>
          <strong>{this.state.answerInfo.answer}</strong><br/>
          <strong>{this.state.answerInfo.date}</strong>
          </div>
        }
      }
    }else{
      if(this.props.itemInfo.owner === this.props.account){
        if(this.props.itemInfo.noAnswers > 0){
          status = <Button bsStyle="primary" onClick={this.handleShow}>
            ACCEPT AN ANSWER
          </Button>
        }else {
          status = <h4>Waiting For Answers</h4>
        }
      }else{
        status = <Button bsStyle="primary" onClick={this.handleShow}>
          SUBMIT AN ANSWER
        </Button>
      }
    }

    return (
      <div>
        <hr></hr>
        {status}

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Item Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>Owner: {this.props.itemInfo.owner}</h3>
            <NewAnswerForm
              contract={this.props.contract}
              account={this.props.account}
              itemNo={this.props.itemNo}
              noAnswers={this.props.noAnswers}
              itemInfo={this.props.itemInfo}
              answers={this.state.answers}
              closeModal={this.handleClose}
              uportName={this.props.uportName}
              />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
