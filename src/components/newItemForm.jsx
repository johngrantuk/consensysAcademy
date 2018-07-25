import React from 'react';
import {FormGroup, ControlLabel, FormControl, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
const ipfsHelper = require('../libs/ipfsHelper');
import uuid from 'uuid';
import { getBytes32FromMultiash } from '../libs/multihash';

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
      picHash: '',
      picLink: 'https://images.unsplash.com/photo-1475724017904-b712052c192a?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=e1527896a195e76507c9b2b49c29e055&auto=format&fit=crop&w=1350&q=80',
      ipfsUploaded: false,
      saveToEth: false,
      picData: 'none'
    };
  }
  handleInfoChange(e) {
    this.setState({ info: e.target.value });
  }
  handleBountyChange(e) {
    this.setState({ bounty: e.target.value });
  }

  async saveToBlockChainNew(PicData, Info, Bounty, Web3, Account) {

      if(PicData === 'none'){
          console.log('You need to save a picture!')
          return;
      }

      const hash = await ipfsHelper.uploadPic(PicData);           // Upload pic to IPFS
      console.log('Upload Done: ' + hash);
      /*
      this.setState({
        picHash: hash,
        picLink: 'https://ipfs.io/ipfs/' + hash,
        ipfsUploaded: true,
      })
      */

      const itemDetails = {
        id: uuid.v4(),
        date: new Date().toLocaleString(),
        info: Info,
        bounty: Bounty,
        picHash: hash
      };

      console.log('Uploading Item Info to IPFS...')
      const infoHash = await ipfsHelper.uploadInfo(itemDetails);

      console.log('Submitting Info To Ethereum: ');
      console.log('Bounty:' + Bounty);
      console.log('Info Hash: ' + infoHash);
      console.log('Pic Hash: ' + hash);

      let itemMultiHash = getBytes32FromMultiash(infoHash);
      let picMultiHash = getBytes32FromMultiash(hash);
      await this.props.contract.makeItem.sendTransaction(itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: Web3.toWei(this.state.bounty, 'ether'), from: Account});

      console.log('Transaction sent.');

  }

  handleSubmit() {
    this.saveToBlockChainNew(this.state.picData, this.state.info, this.state.bounty, this.props.web3, this.props.account);
    this.props.closeModal();
    /*
    if(this.state.ipfsUploaded){                        // If picture finished uploading to IPFS save info to Blockchain
      this.saveToBlockChain();
    }
    else{                                             // If picture still uploading to IPFS then wait for it to finish before saving to Blockchain
      console.log('Waiting for IPFS upload...');
      this.setState({
        saveToEth: true
      })
    }
    */
  }

  async saveToBlockChain(PicData) {

      if(PicData ==='none'){
          console.log('You need to save a picture!')
          return;
      }

      const hash = await ipfsHelper.uploadPic(PicData);           // Upload pic to IPFS
      console.log('Upload Done: ' + hash);
      /*
      this.setState({
        picHash: hash,
        picLink: 'https://ipfs.io/ipfs/' + hash,
        ipfsUploaded: true,
      })
      */

      const itemDetails = {
        id: uuid.v4(),
        date: new Date().toLocaleString(),
        info: this.state.info,
        bounty: this.state.bounty,
        picHash: this.state.picHash
      };

      console.log('Uploading Item Info to IPFS...')
      const infoHash = await ipfsHelper.uploadInfo(itemDetails);

      console.log('Submitting Info To Ethereum: ');
      console.log('Bounty:' + this.state.bounty);
      console.log('Info Hash: ' + infoHash);
      console.log('Pic Hash: ' + this.state.picHash);

      let itemMultiHash = getBytes32FromMultiash(infoHash);
      let picMultiHash = getBytes32FromMultiash(this.state.picHash);
      await this.props.contract.makeItem.sendTransaction(itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: this.props.web3.toWei(this.state.bounty, 'ether'), from: this.props.account});

      console.log('Transaction sent.');

      // console.log()

      /*
      if(this.state.saveToEth){                                         // This is true when user clicked SUBMIT but IPFS was still uploading
        this.saveToBlockChain();
      }else{                                                            // Waiting for user to click SUBMIT
        console.log('Waiting for submit button press...')
        this.setState({
          ipfsUploaded: true
        })
      }

      const itemDetails = {
        id: uuid.v4(),
        date: new Date().toLocaleString(),
        info: this.state.info,
        bounty: this.state.bounty,
        picHash: this.state.picHash
      };

      console.log('Uploading Item Info to IPFS...')
      const infoHash = await ipfsHelper.uploadInfo(itemDetails);

      console.log('Submitting Info To Ethereum: ');
      console.log('Bounty:' + this.state.bounty);
      console.log('Info Hash: ' + infoHash);
      console.log('Pic Hash: ' + this.state.picHash);

      let itemMultiHash = getBytes32FromMultiash(infoHash);
      let picMultiHash = getBytes32FromMultiash(this.state.picHash);
      await this.props.contract.makeItem.sendTransaction(itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: this.props.web3.toWei(this.state.bounty, 'ether'), from: this.props.account});

      console.log('Transaction sent.');

      this.setState({
        saveToEth: false,
        ipfsUploaded: false,
      })
      */
  }

  upload = (e) => {
    // https://gist.github.com/sogoiii/e07ff464c4ff8a6fa9daa0ca927af3cb, https://ether.direct/2017/07/25/uploading-an-image-to-ipfs/

    this.setState({
      ipfsUploaded: false
    });

    const reader = new FileReader();

    reader.onloadend = async () => {                                    // Runs once file uploaded to browser

      this.setState({
        picData: reader.result
      })
      /*
      const hash = await ipfsHelper.uploadPic(reader.result);           // Upload pic to IPFS
      console.log('Upload Done: ' + hash);
      this.setState({
        picHash: hash,
        picLink: 'https://ipfs.io/ipfs/' + hash,
        ipfsUploaded: true,
      })

      if(this.state.saveToEth){                                         // This is true when user clicked SUBMIT but IPFS was still uploading
        this.saveToBlockChain();
      }else{                                                            // Waiting for user to click SUBMIT
        console.log('Waiting for submit button press...')
        this.setState({
          ipfsUploaded: true
        })
      }
      */
    }
    this.setState({
      picData: 'reading'
    })
    reader.readAsArrayBuffer(e.files[0]); // Read Provided File
  }

  render() {

    const tooltipPicUpload = (
      <Tooltip id="tooltipPicUpload">
        <strong>The picture will be uploaded to IPFS</strong>
      </Tooltip>
    );

    const tooltipSubmit = (
      <Tooltip id="tooltipSubmit">
        <strong>Metamask will ask for confirmation of transaction. Then picture stored to IPFS, Info stored to IPFS then IPFS Hashes Saved To Blockchain. This will can take some time so will be done in background. Item will appear on front page when complete.</strong>
      </Tooltip>
    );

    let submit;
    if(this.state.picData === 'none'){
      submit = <h3>PLEASE SELECT A PICTURE</h3>
    }else{
      submit =
      <OverlayTrigger placement="right" overlay={tooltipSubmit}>
        <Button bsStyle="primary"  onClick={this.handleSubmit}>Submit To Blockchain</Button>
      </OverlayTrigger>
    }

    return (
      <form>
        <img role="presentation" style={{"width" : "100%"}} src={this.state.picLink}/>
        <p></p>
        <OverlayTrigger placement="right" overlay={tooltipPicUpload}>
          <label className="btn btn-primary btn-file">
              Select Picture To Upload <input type="file" style={{"display": "none"}} id="fileInput" onChange={(e) => this.upload(e.target)} />
          </label>
        </OverlayTrigger>
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
          {submit}
        </FormGroup>
      </form>
    );
  }
}
