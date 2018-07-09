import React from 'react';
import {Button, Col, Panel } from 'react-bootstrap';

export default class ItemList extends React.Component {


    render() {
      return(
        <div id="petTemplate">
          <Col sm={6} md={4} lg={3}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">{this.props.itemInfo.name}</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <img role="presentation" style={{"width" : "100%"}} src="https://animalso.com/wp-content/uploads/2017/01/Golden-Retriever_6.jpg"/>
                <br/><br/>
                <strong>Breed</strong>: <span>Golden Retriever</span><br/>
                <strong>Age</strong>: <span>3</span><br/>
                <strong>Location</strong>: <span>Warren, MI</span><br/><br/>
                <Button bsStyle="primary" data-id="0">Adopt</Button>
              </Panel.Body>
            </Panel>
          </Col>
        </div>
      );
    }
}
