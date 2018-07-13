import React from 'react';
import {FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';
const ipfsHelper = require('../libs/ipfsHelper');

export default class NewItemForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleBountyChange = this.handleBountyChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      value: '',
      info: '',
      bounty: '0',
      picLink: 'https://images.unsplash.com/photo-1475724017904-b712052c192a?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=e1527896a195e76507c9b2b49c29e055&auto=format&fit=crop&w=1350&q=80',
      ipfsUploaded: false,
      saveToEth: false,
    };
  }
  handleInfoChange(e) {
    this.setState({ info: e.target.value });
  }
  handleBountyChange(e) {
    this.setState({ bounty: e.target.value });
  }
  handleSubmit() {

    // Make a promise here that waits for IPFS upload
    if(this.state.ipfsUploaded){
      console.log('Submitting Info To Ethereum: ');
      console.log(this.state.bounty);
      console.log(this.state.info);
      console.log(this.state.picLink);

      this.props.contract.makeItem(this.state.value, {from: this.props.account})
      .then(result => {
        console.log('Add result:')
        console.log(result)
        // Once Done
        this.setState({
          saveToEth: false,
          ipfsUploaded: false,
        })
      });
    }
    else{
      console.log('Waiting for IPFS upload...');
      this.setState({
        saveToEth: true
      })
    }
  }
  upload = (e) => {
    // https://gist.github.com/sogoiii/e07ff464c4ff8a6fa9daa0ca927af3cb, https://ether.direct/2017/07/25/uploading-an-image-to-ipfs/

    this.setState({
      ipfsUploaded: false
    });

    console.log('Upload');
    console.log(e)
    console.log(e.files)
    console.log(e.result)
    const reader = new FileReader();

    reader.onloadend = async () => {
      console.log('ONLOADEND')
      console.log(reader.result)
      //await ecp.init();
      //await ecp.uploadPic(reader.result);
      // await ecp.stop();
      //const hash = IpfsSavePic(reader);
      //console.log(hash);
      const hash = await ipfsHelper.uploadPic(reader.result);
      console.log('Upload Done: ' + hash);
      this.setState({
        picLink: 'https://ipfs.io/ipfs/' + hash,
        ipfsUploaded: true,
      })

      if(this.state.saveToEth){
        console.log('Submitting Info To Ethereum: ');
        console.log(this.state.bounty);
        console.log(this.state.info);
        console.log(this.state.picLink);

        // Once Done
        this.setState({
          saveToEth: false,
          ipfsUploaded: false,
        })
      }else{
        console.log('Waiting for submit...')
        this.setState({
          ipfsUploaded: true
        })
      }
    }

    reader.readAsArrayBuffer(e.files[0]); // Read Provided File
  }

  render() {
    return (
      <form>
        <img role="presentation" style={{"width" : "100%"}} src={this.state.picLink}/>
        <p><input type="file" id="fileInput" onChange={(e) => this.upload(e.target)}/></p>
        <label className="btn btn-default btn-file">
            Select Item To Upload <input type="file" style={{"display": "none"}} id="fileInput" onChange={(e) => this.upload(e.target)} />
        </label>

        <FormGroup
          controlId="formBasicText"
        >
          <ControlLabel>Bounty Amount (ETH)</ControlLabel>
          <FormControl
            type="text"
            value={this.state.bounty}
            placeholder="e.g. 0.001"
            onChange={this.handleBountyChange}
          />

          <FormGroup controlId="formControlsTextarea">
            <ControlLabel>Info</ControlLabel>
            <FormControl
              componentClass="textarea"
              value={this.state.info}
              placeholder="e.g. I saw this in Scotland in July."
              onChange={this.handleInfoChange}
            />
          </FormGroup>
          <Button bsStyle="primary"  onClick={this.handleSubmit}>Submit</Button>
        </FormGroup>
      </form>
    );
  }
}
