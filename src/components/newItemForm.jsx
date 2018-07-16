import React from 'react';
import {FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
const ipfsHelper = require('../libs/ipfsHelper');
import uuid from 'uuid';

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
      picHash: 'https://images.unsplash.com/photo-1475724017904-b712052c192a?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=e1527896a195e76507c9b2b49c29e055&auto=format&fit=crop&w=1350&q=80',
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

  async saveToBlockChain() {
      console.log('Submitting Info To Ethereum: ');
      console.log(this.state.bounty);
      console.log(this.state.info);
      console.log(this.state.picHash);

      const itemDetails = {
        id: uuid.v4(),
        date: new Date().toLocaleString(),
        info: this.state.info,
        bounty: this.state.bounty,
        picHash: this.state.picHash
      };

      const infoHash = await ipfsHelper.uploadInfo(itemDetails);

      let hash = await this.props.contract.makeItem.sendTransaction(infoHash, this.state.picHash, {value: this.props.web3.toWei(this.state.bounty, 'ether'), from: this.props.account});
      console.log('makeItem done:');
      console.log(hash);

      this.setState({
        saveToEth: false,
        ipfsUploaded: false,
      })
  }

  handleSubmit() {
    if(this.state.ipfsUploaded){                        // If picture finished uploading to IPFS save info to Blockchain
      this.saveToBlockChain();
    }
    else{                                             // If picture still uploading to IPFS then wait for it to finish before saving to Blockchain
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

    const reader = new FileReader();

    reader.onloadend = async () => {                                    // Runs once file uploaded to browser

      const hash = await ipfsHelper.uploadPic(reader.result);           // Upload pic to IPFS
      console.log('Upload Done: ' + hash);
      this.setState({
        picHash: hash,
        ipfsUploaded: true,
      })

      if(this.state.saveToEth){                                         // This is true when user clicked SUBMIT but IPFS was still uploading
        this.saveToBlockChain();
      }else{                                                            // Waiting for user to click SUBMIT
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
        <img role="presentation" style={{"width" : "100%"}} src={'https://ipfs.io/ipfs/' + this.state.picHash}/>
        <p></p>
        <label className="btn btn-primary btn-file">
            Select Item To Upload <input type="file" style={{"display": "none"}} id="fileInput" onChange={(e) => this.upload(e.target)} />
        </label>
        <p></p>
        <hr></hr>
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
