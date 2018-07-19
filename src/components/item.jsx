import React from 'react';
import {Col, Panel } from 'react-bootstrap';
import ModalAnswer from './modalAnswer';
import getWeb3 from '../utils/getWeb3'

export default class Item extends React.Component {

    render() {

      let status;

      if(this.props.itemInfo.cancelled){
        status =
          <Panel.Body>
            <img role="presentation" style={{"width" : "100%"}} src={this.props.itemInfo.picLink}/>
            <br/><br/>
            <hr></hr>
            <strong>THIS ITEM IS CANCELLED</strong>
          </Panel.Body>
      }else{
        status =
          <Panel.Body>
            <img role="presentation" style={{"width" : "100%"}} src={this.props.itemInfo.picLink}/>
            <br/><br/>
            <strong>Bounty: </strong>: <span>{this.props.itemInfo.bountyEth}Eth</span><br/>
            <strong>Info</strong>: <span>{this.props.itemInfo.info}</span><br/>
            <strong>Answers</strong>: <span>{this.props.itemInfo.noAnswers}</span><br/>

            <ModalAnswer
              itemNo={this.props.itemInfo.itemNo}
              noAnswers={this.props.itemInfo.noAnswers}
              contract={this.props.contract}
              web3={this.props.web3}
              account={this.props.account}
              itemInfo={this.props.itemInfo}
              />
          </Panel.Body>
      }

      return(
        <div>
          <Col sm={6} md={4} lg={3}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">{this.props.itemInfo.itemNo}: {this.props.itemInfo.date}</Panel.Title>
              </Panel.Heading>
              {status}
            </Panel>
          </Col>
        </div>
      );
    }
}
