import React from 'react';
import {Button, Jumbotron, Row, Col, Panel } from 'react-bootstrap';
import uuid from 'uuid';
const ecp = require('./ecp');
import Task from '../build/contracts/Task.json'
import getWeb3 from './utils/getWeb3'

var extPicList = [];

export default class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      picList: extPicList,
      selectedFile: '',
      noTasks: 'Not loaded'
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
  handleAddTaskEvent = () => {
    console.log("Booyaka")
    //console.log(result.args.id.c[0])
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
          </div>
        </Jumbotron>

        <div>
          <Row>
            <Col md={4}>
              <h2>Heading</h2>
              <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>
              <p></p>
            </Col>
            <Col md={4}>
              <h2>Heading</h2>
              <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>
              <p></p>
           </Col>
            <Col md={4}>
              <h2>Heading</h2>
              <p>Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>
              <p></p>
            </Col>
            <Col md={4}>
              <h2>Heading</h2>
              <p>Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>
              <p></p>
            </Col>
          </Row>

          <hr/>

          <footer>
            <p>&copy; 2016 Company, Inc.</p>
          </footer>
        </div>

        <div id="petTemplate">
          <Col sm={6} md={4} lg={3}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">Scrappy</Panel.Title>
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

        {picList.map(pic =>
          <p>{pic}</p>
        )}

      </div>
    );
  }
}
