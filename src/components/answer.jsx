import React from 'react';
import {Button, Tooltip, OverlayTrigger } from 'react-bootstrap';

export default class Answer extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
      this.acceptOnChain();
      this.props.closeModal();
    }

    async acceptOnChain() {
      // Save the Answer to Blockchain
      console.log('Accepting onchain...')
      await this.props.contract.acceptAnswer.sendTransaction(this.props.answerInfo.itemNo, this.props.answerInfo.answerNo, {from: this.props.account});
      console.log('Accepting onchain done!')
    }

    render() {

      const tooltipAccept = (
        <Tooltip id="tooltipAccept">
          <strong>Answer is marked as accepted. Bounty transferred to owner of answer.</strong>
        </Tooltip>
      );

      let status;
      if(this.props.itemOwner === this.props.account){
        status = <div>
                  {this.props.answerInfo.uportName} {this.props.answerInfo.date} {this.props.answerInfo.answer}
                  <OverlayTrigger placement="right" overlay={tooltipAccept}>
                    <Button bsStyle="primary"  onClick={this.handleSubmit}>Accept Answer</Button>
                  </OverlayTrigger>
                  <hr></hr>
                </div>
      }else{
        status = <div>
                  {this.props.answerInfo.uportName} {this.props.answerInfo.date} {this.props.answerInfo.answer}
                  <hr></hr>
                </div>
      }

      return(
        <div>
        {status}
        </div>
      );
    }
}
