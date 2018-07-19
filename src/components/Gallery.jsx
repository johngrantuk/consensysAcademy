import React from 'react';
import { Jumbotron } from 'react-bootstrap';
import uuid from 'uuid';
const ecp = require('../libs/ecp');
const itemHelper = require('../libs/itemHelper');
const ipfsHelper = require('../libs/ipfsHelper');
import Item from '../../build/contracts/Item.json'
import getWeb3 from '../utils/getWeb3'
import ModalAdd from './modalAdd';
import ItemList from './itemList'

var extPicList = [];

export default class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      picList: extPicList,
      selectedFile: '',
      noItems: 'Not loaded',
      items: [{name: 'default'}, {name: 'default2'}],
      picLink: 'None'
    }

  }
  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateItemContract();
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }
  updateLink(Link){
    console.log('updateLink')
    this.setState({picLink: Link});
  }
  instantiateItemContract() {
    const contract = require('truffle-contract')
    const item = contract(Item)
    item.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var itemInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      item.deployed().then((instance) => {
        itemInstance = instance;
        var event = itemInstance.ItemAdded({_from: this.state.web3.eth.coinbase});
        //event.watch(this.handleAddItemEvent(error, result));

        event.watch((error, result) => {
            if (!error){
              // console.log(result);
              // console.log(result.args.id.c[0])
              this.setState({
                noItems: result.args.id.c[0]
              })
            }

            this.loadItems();
        });

        return itemInstance.getItemCount({from: accounts[0]})
      }).then((result) => {
        // console.log('Number of items: ' + result);
        // console.log(result)
        console.log('Account - ' + accounts[0])
        this.setState({
          noItems: result.c[0],
          contractItem: itemInstance,
          account: accounts[0]
        })

        this.loadItems();
      })
    })
  }
  async loadItems(){                                                                                    // Called from constructor to load all holes from colony
    console.log('loadItems()')
    const items = await itemHelper.getItems(this.state.web3, this.state.contractItem, this.state.account);
    this.setState({
      items: items
    });
  }

  async IpfsSavePic(ReaderData){
    console.log('IpfsSavePic')
    console.log(ReaderData)
    console.log(ReaderData.result)
    await ecp.init();

    await ecp.uploadPic(ReaderData);

    await ecp.stop();
  }
  upload = (e) => {
    // https://gist.github.com/sogoiii/e07ff464c4ff8a6fa9daa0ca927af3cb, https://ether.direct/2017/07/25/uploading-an-image-to-ipfs/
    // e.target.files
    console.log('Upload');
    console.log(e)
    console.log(e.files)
    console.log(e.result)
    const reader = new FileReader();

    // reader.onloadend = this.IpfsSavePic(reader)     // reader.result = null

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
        picLink: 'https://ipfs.io/ipfs/' + hash
      })
    }
    //const photo = document.getElementById("photo");
    reader.readAsArrayBuffer(e.files[0]); // Read Provided File
  }
  addItem = () => {
    const contract = this.state.contractItem;
    const account = this.state.account;

    var value = "Johns Test";

    contract.makeItem(value, {from: account})
    .then(result => {
      console.log('Add result:')
      console.log(result)
    })
  }
  async IpfsSave(Info){
    await ecp.init();

    const specificationHash = await ecp.saveItemSpecification(Info);

    extPicList.concat(specificationHash);

    console.log(specificationHash);
    this.setState({
      picList: this.state.picList.concat(specificationHash)
    });

    var loadedInfo = await ecp.getItemSpecification(specificationHash);

    console.log(loadedInfo)

    await ecp.stop();
  }

  recordHole = (Hole) => {
    console.log('Clicked')
    //console.log(Hole);
    const id = uuid.v4();
    const date = new Date().toLocaleString();                                                                     // Date/time of record

    const holeDetails = {
      id: id,
      date: date,
    };

    this.IpfsSave(holeDetails);
  }

  render() {
    return (
      <div>
        <Jumbotron>
          <div>
            <h1>What Is It?</h1>
            <p>DApp that allows user to upload a picture of something they want identified with an associated bounty for the correct answer.</p>
            <p>No items: {this.state.noItems}</p>
            <ModalAdd
              contract={this.state.contractItem}
              account={this.state.account}
              web3={this.state.web3}
              />
          </div>
        </Jumbotron>

        <ItemList
          items={this.state.items}
          contract={this.state.contractItem}
          account={this.state.account}
          web3={this.state.web3}
          />

      </div>
    );
  }
}
