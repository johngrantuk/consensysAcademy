import React from 'react';
import {FormGroup, ControlLabel, FormControl, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
const ipfsHelper = require('../libs/ipfsHelper');
import uuid from 'uuid';
import { getBytes32FromMultiash } from '../libs/multihash';
import Answer from './answer'

export default class NewAnswerForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleAnswerChange = this.handleAnswerChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);

    this.state = {
      value: '',
      answer: '',
      picHash: '',
      picLink: this.props.itemInfo.picLink
    };
  }

  handleAnswerChange(e) {
    this.setState({ answer: e.target.value });
  }
  async saveToBlockChain() {
      console.log('ItemNo: ' + this.props.itemNo);
      console.log('Submitting Answer To Ethereum: ');
      console.log('Will be answer no: ' + (Number(this.props.noAnswers) + 1));
      console.log(this.state.answer);

      const answerDetails = {
        itemNo: this.props.itemNo,
        answerNo: (Number(this.props.noAnswers) + 1),
        id: uuid.v4(),
        date: new Date().toLocaleString(),
        answer: this.state.answer,
      };

      const answerHash = await ipfsHelper.uploadInfo(answerDetails);
      console.log('Answer hash: ' + answerHash)

      let answerMultiHash = getBytes32FromMultiash(answerHash);
      await this.props.contract.addAnswer.sendTransaction(this.props.itemNo, answerMultiHash.digest, answerMultiHash.hashFunction, answerMultiHash.size, {from: this.props.account});
      console.log('Transaction sent.')
  }

  async CancelItem(){
    await this.props.contract.cancelItem.sendTransaction(2, {from: this.props.account});
  }

  handleSubmit() {
    this.saveToBlockChain();
    this.props.closeModal();
  }

  handleCancel() {
    console.log('Canceling Item')
    this.CancelItem();
    this.props.closeModal();
  }

  render() {

    const tooltipAnswer = (
      <Tooltip id="tooltipAnswer">
        <strong>Answer stored to IPFS then hash submitted to Blockchain. May take some time so will be done in background.</strong>
      </Tooltip>
    );

    const tooltipCancel = (
      <Tooltip id="tooltipCancel">
        <strong>Item will be cancelled and Bounty refunded to owner account.</strong>
      </Tooltip>
    );

    const answers = this.props.answers;

    let status;
    if(this.props.itemInfo.owner === this.props.account){
      status =
      <OverlayTrigger placement="right" overlay={tooltipCancel}>
        <Button bsStyle="primary"  onClick={this.handleCancel}>CANCEL ITEM</Button>
      </OverlayTrigger>
    }else{
      status =
        <FormGroup controlId="formBasicText">
          <FormGroup controlId="formControlsTextarea">
            <ControlLabel>Your Answer</ControlLabel>
            <FormControl
              componentClass="textarea"
              value={this.state.answer}
              placeholder="e.g. The lesser spotted butterfly perched on the Orangie Flouer."
              onChange={this.handleAnswerChange}
            />
          </FormGroup>
          <OverlayTrigger placement="right" overlay={tooltipAnswer}>
            <Button bsStyle="primary"  onClick={this.handleSubmit}>Submit Answer</Button>
          </OverlayTrigger>
        </FormGroup>
    }

    return (
      <form>
        <img role="presentation" style={{"width" : "100%"}} src={this.state.picLink}/>
        <hr></hr>
        {answers.map(answer =>
          <Answer
            key={answer.id}
            itemOwner={this.props.itemInfo.owner}
            answerInfo={answer}
            contract={this.props.contract}
            account={this.props.account}
            closeModal={this.props.closeModal}
            />
        )}
        {status}
      </form>
    );
  }
}
