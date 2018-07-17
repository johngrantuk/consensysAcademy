import React from 'react';
import {FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
const ipfsHelper = require('../libs/ipfsHelper');
import uuid from 'uuid';
import { getBytes32FromMultiash } from '../libs/multihash';
import Answer from './answer'

export default class NewAnswerForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleAnswerChange = this.handleAnswerChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

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
      let hash = await this.props.contract.addAnswer.sendTransaction(this.props.itemNo, answerMultiHash.digest, answerMultiHash.hashFunction, answerMultiHash.size, {from: this.props.account});
  }

  handleSubmit() {
    this.saveToBlockChain();
  }

  render() {

    const answers = this.props.answers;

    return (
      <form>
        <img role="presentation" style={{"width" : "100%"}} src={this.state.picLink}/>
        <hr></hr>
        {answers.map(answer =>
          <Answer
            key={answer.id}
            answerInfo={answer}
            contract={this.props.contract}
            account={this.props.account}
            />
        )}
        <hr></hr>
        <FormGroup controlId="formBasicText">
          <FormGroup controlId="formControlsTextarea">
            <ControlLabel>Answer</ControlLabel>
            <FormControl
              componentClass="textarea"
              value={this.state.answer}
              placeholder="e.g. The lesser spotted butterfly perched on the Orangie Flouer."
              onChange={this.handleAnswerChange}
            />
          </FormGroup>
          <Button bsStyle="primary"  onClick={this.handleSubmit}>Submit Answer</Button>
        </FormGroup>
      </form>
    );
  }
}
