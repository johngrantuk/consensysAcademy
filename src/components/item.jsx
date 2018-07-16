import React from 'react';
import {Button, Col, Panel } from 'react-bootstrap';

export default class ItemList extends React.Component {


    render() {
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
                <strong>Date</strong>: <span>{this.props.itemInfo.date}</span><br/>
                <strong>Bounty</strong>: <span>{this.props.itemInfo.bounty}</span><br/>
                <strong>Info</strong>: <span>{this.props.itemInfo.info}</span><br/>
                <Button bsStyle="primary" data-id="0">ANSWER</Button>
              </Panel.Body>
            </Panel>
          </Col>
        </div>
      );
    }
}
