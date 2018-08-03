import React from 'react';
import { Jumbotron } from 'react-bootstrap';
const itemHelper = require('../libs/itemHelper');
import ItemUpgradeable from '../../build/contracts/ItemUpgradeable.json';
import Parent from '../../build/contracts/Parent.json';
import getWeb3 from '../utils/getWeb3'
import ModalAdd from './modalAdd';
import ItemList from './itemList';
import Uport from './uport';
import Oracle from './oracle';
import OracleEthPrice from '../../build/contracts/OracleEthPrice.json';

export default class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      noItems: 'Not loaded',
      //items: [{name: 'default'}, {name: 'default2'}],
      items: [],
      uportCredentials: 'No Credentials',
      uportCredentialsName: 'No UPort Info'
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
      //this.instantiateItemContract();
      this.state.web3.eth.getAccounts((error, accounts) => {
        this.loadContracts(accounts);
      });
    })
    .catch(() => {
      console.log('Error finding web3.')
    });
  }

  checkMetaMask() {
    // Checks for active MetaMask account info.
    if (this.state.web3.eth.accounts[0] !== this.state.account) {
      this.setState({
        account: this.state.web3.eth.accounts[0]
      })
      this.loadItems();
    }
  }

  handleUportInfo = (UportInfo) => {
    // Use UPort Name for Items/Answers
    console.log('Handle UPort Info');
    console.log(UportInfo.name)
    this.setState({
      uportCredentials: UportInfo,
      uportCredentialsName: UportInfo.name
    })
  }

  async loadContracts(accounts){
    // Load the contracts
    const contract = require('truffle-contract');

    const parent = contract(Parent);
    parent.setProvider(this.state.web3.currentProvider);

    let parentInstance = await parent.deployed();

    let itemAddr;
    itemAddr = await parentInstance.getItemContractAddress.call(1);
    console.log(itemAddr)

    const item = contract(ItemUpgradeable);
    item.setProvider(this.state.web3.currentProvider);

    let ItemUpgradeableInstance = await item.at(itemAddr);

    this.SetUpItemEvents(ItemUpgradeableInstance);
    console.log('test')
    let itemCount = await ItemUpgradeableInstance.getItemCount({from: accounts[0]});

    this.setState({
      noItems: itemCount.toNumber(),
      contractItem: ItemUpgradeableInstance,
      account: accounts[0]
    })

    setInterval(() => this.checkMetaMask(), 100);
    this.loadItems();

    let oracle = contract(OracleEthPrice);
    oracle.setProvider(this.state.web3.currentProvider);

    let oracleInstance = await oracle.deployed();

    this.setState({
      oracleInstance: oracleInstance
    })
  }

  SetUpItemEvents(itemInstance) {
    // Set up listening for Blockchain events.

    var itemAddedEvent = itemInstance.ItemAdded({_from: this.state.web3.eth.coinbase});

    itemAddedEvent.watch((error, result) => {
      console.log('ItemAddedEvent')
      if (!error){
        this.setState({
          noItems: result.args.id.c[0]
        })
      }

      this.loadItems();
    });

    var answerAddedEvent = itemInstance.AnswerAdded({_from: this.state.web3.eth.coinbase});

    answerAddedEvent.watch((error, result) => {
      console.log('AnswerAddedEvent')
      this.loadItems();
    });

    var answerAcceptedEvent = itemInstance.AnswerAccepted({_from: this.state.web3.eth.coinbase});

    answerAcceptedEvent.watch((error, result) => {
      console.log('AnswerAcceptedEvent')
      this.loadItems();
    });

    var itemCancelledEvent = itemInstance.ItemCancelled({_from: this.state.web3.eth.coinbase});

    itemCancelledEvent.watch((error, result) => {
      console.log('ItemCancelledEvent')
      this.loadItems();
    });
  }

  async loadItems(){
    // Loads all Items from Blockchain/IPFS
    const items = await itemHelper.getItems(this.state.web3, this.state.contractItem, this.state.account);
    this.setState({
      items: items
    });
  }

  render() {
    return (
      <div>
        <Jumbotron>
          <div>
            <h1>What Is It?</h1>
            <p>Upload A Pictue Of Something You Want Identified</p>
            <p>Set A Bounty To Encourage People To Answer</p>
            <p>You're currently using MetaMask Account: {this.state.account}</p>
            <p>No Items To Identified: {this.state.noItems}</p>
            <ModalAdd
              contract={this.state.contractItem}
              account={this.state.account}
              web3={this.state.web3}
              uportName={this.state.uportCredentialsName}
              />
          </div>
        </Jumbotron>

        <div>
        <ItemList
          items={this.state.items}
          contract={this.state.contractItem}
          account={this.state.account}
          web3={this.state.web3}
          uportName={this.state.uportCredentialsName}
          />
        </div>

        <Uport handleUportInfo={this.handleUportInfo}></Uport>

        <Oracle
          account={this.state.account}
          web3={this.state.web3}
          oracleInstance={this.state.oracleInstance}
          >
        </Oracle>
      </div>
    );
  }
}
