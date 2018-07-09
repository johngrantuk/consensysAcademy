import React from 'react';
import {Button, Jumbotron, Row, Col } from 'react-bootstrap';
import uuid from 'uuid';
const ecp = require('../libs/ecp');
const itemHelper = require('../libs/itemHelper');
import Task from '../../build/contracts/Task.json'
import getWeb3 from '../utils/getWeb3'
import Example from './modalAdd';
import ItemList from './itemList'

var extPicList = [];

export default class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      picList: extPicList,
      selectedFile: '',
      noTasks: 'Not loaded',
      items: [{name: 'default'}, {name: 'default2'}]
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
      this.instantiateTaskContract();
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }
  instantiateTaskContract() {
    const contract = require('truffle-contract')
    const task = contract(Task)
    task.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var taskInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      task.deployed().then((instance) => {
        taskInstance = instance;
        var event = taskInstance.TaskAdded({_from: this.state.web3.eth.coinbase});
        //event.watch(this.handleAddTaskEvent(error, result));

        event.watch((error, result) => {
            if (!error){
              console.log('TASK ADDED!')
              console.log(result);
              console.log(result.args.id.c[0])
              this.setState({
                noTasks: result.args.id.c[0]
              })
            }

            this.loadItems();
        });

        return taskInstance.getTaskCount({from: accounts[0]})
      }).then((result) => {
        console.log('Number of tasks: ' + result);
        console.log(result)
        // Would get all tasks here
        this.setState({
          noTasks: result.c[0],
          contractTask: taskInstance,
          account: accounts[0]
        })
      })
    })
  }
  async loadItems(){                                                                                    // Called from constructor to load all holes from colony
    const items = await itemHelper.getItems(this.state.web3, this.state.contractTask, this.state.account);
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

    reader.onloadend = async function() {
      console.log('ONLOADEND')
      console.log(reader.result)
      await ecp.init();

      await ecp.uploadPic(reader.result);

      // await ecp.stop();
      //const hash = IpfsSavePic(reader);
      //console.log(hash);
    }
    //const photo = document.getElementById("photo");
    reader.readAsArrayBuffer(e.files[0]); // Read Provided File
  }
  addTask = () => {
    const contract = this.state.contractTask;
    const account = this.state.account;

    var value = "Johns Test";

    contract.makeTask(value, {from: account})
    .then(result => {
      console.log('Add result:')
      console.log(result)
    })
  }
  async IpfsSave(Info){
    await ecp.init();

    const specificationHash = await ecp.saveTaskSpecification(Info);

    extPicList.concat(specificationHash);

    console.log(specificationHash);
    this.setState({
      picList: this.state.picList.concat(specificationHash)
    });


    var loadedInfo = await ecp.getTaskSpecification(specificationHash);

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
    const picList = this.state.picList;

    return (
      <div>
        <Jumbotron>
          <div>
            <h1>Hello, world!</h1>
            <p>This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.</p>
            <p><Button bsStyle="primary" onClick={(e) => this.addTask()}>Learn more &raquo;</Button></p>
            <p><input type="file" id="fileInput" onChange={(e) => this.upload(e.target)}/></p>
            <p>No tasks: {this.state.noTasks}</p>
            <Example
              contract={this.state.contractTask}
              account={this.state.account}
              />
          </div>
        </Jumbotron>

        <ItemList
          items={this.state.items}
          />

      </div>
    );
  }
}
