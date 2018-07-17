import React from 'react';
import {Button, Col, Panel } from 'react-bootstrap';
import ModalAnswer from './modalAnswer';

export default class Item extends React.Component {
    render() {

      const isAnswered = this.props.itemInfo.finalised;
      let status;

      if(isAnswered){
        status = <h1>ANSWERED</h1>
      }else{
        status = <h3>Click Details To Answe</h3>
      }

      return(
        <div id="petTemplate" key={this.props.itemInfo.id}>
          <Col sm={6} md={4} lg={3}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">{this.props.itemInfo.bounty}</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <img role="presentation" style={{"width" : "100%"}} src={this.props.itemInfo.picLink}/>
                <br/><br/>
                <strong>No</strong>: <span>{this.props.itemInfo.itemNo}</span><br/>
                <strong>Date</strong>: <span>{this.props.itemInfo.date}</span><br/>
                <strong>Bounty</strong>: <span>{this.props.itemInfo.bounty}</span><br/>
                <strong>Info</strong>: <span>{this.props.itemInfo.info}</span><br/>
                <strong>Answers</strong>: <span>{this.props.itemInfo.noAnswers}</span><br/>
                {status}
                <ModalAnswer
                  itemNo={this.props.itemInfo.itemNo}
                  noAnswers={this.props.itemInfo.noAnswers}
                  contract={this.props.contract}
                  web3={this.props.web3}
                  account={this.props.account}
                  itemInfo={this.props.itemInfo}
                  />
              </Panel.Body>
            </Panel>
          </Col>
        </div>
      );
    }
}
