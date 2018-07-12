import React from 'react';
import {FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';

export default class NewItemForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      value: ''
    };
  }

  getValidationState() {
    const length = this.state.value.length;
    if (length > 10) return 'success';
    else if (length > 5) return 'warning';
    else if (length > 0) return 'error';
    return null;
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit() {
    console.log('Info Submitted');
    console.log(this.state.value)
    //this.setState({ show: false });
    this.props.contract.makeItem(this.state.value, {from: this.props.account})
    .then(result => {
      console.log('Add result:')
      console.log(result)
    })
  }

  render() {
    return (
      <form>
        <FormGroup
          controlId="formBasicText"
          validationState={this.getValidationState()}
        >
          <ControlLabel>Working example with validation</ControlLabel>
          <FormControl
            type="text"
            value={this.state.value}
            placeholder="Enter text"
            onChange={this.handleChange}
          />
          <Button onClick={this.handleSubmit}>Submit</Button>
          <FormControl.Feedback />
          <HelpBlock>Validation is based on string length.</HelpBlock>
        </FormGroup>
      </form>
    );
  }
}
