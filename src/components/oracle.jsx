import React from 'react';
import { Button, Col, Panel } from 'react-bootstrap';


const fetch = require('node-fetch');

export default class Oracle extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      oraclePrice: 'Not Updated Yet'
    }

  }

  SetUpOracleEvents(oracleInstance) {
    var updateEvent = oracleInstance.CallbackGetEthPrice({_from: this.props.web3.eth.coinbase});

    updateEvent.watch((error, result) => {
      console.log('updateEvent')
      if (!error){
        /*
        this.setState({
          noItems: result.args.id.c[0]
        })
        */
      }
    });
  }

  handleGetPriceFromOracle = () => {
    console.log('Getting Price From Oracle');
    this.GetPriceFromOracle();
  }

  async GetPriceFromOracle() {

    let ethPrice = await this.props.oracleInstance.getEthPrice.call();

    console.log(ethPrice.toNumber())

    ethPrice = this.props.web3.fromWei(ethPrice, 'ether')

    this.setState({
      oraclePrice: ethPrice.toNumber()
    });
  }

  handleUpdatePrice = () => {
    console.log('Updating Price');
    this.UpdatePrice();
  }

  async UpdatePrice(){
    //this.SetUpOracleEvents(oracleInstance);

    fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/')
    .then(res => res.json())
    .then(json => {
      console.log(json)
      console.log(json[0].price_usd);
      var price = this.props.web3.toWei(json[0].price_usd, 'ether');
      console.log('Updating price: ' + price);
      this.props.oracleInstance.setEthPrice(price, {from: this.props.account})
    });

  }

  render() {

    return (
        <div>
          <Col sm={12} md={12} lg={12}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">Current Eth/USD Price - Oracle Function</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <h3>Eth Price: ${this.state.oraclePrice}</h3>
                <h4>
                  Shows the Eth/USD price to help chose an appropriate Bounty amount.<br/>
                  This demonstrates an Oracle function. Click the 'Update Oracle' button to retreive the Eth/USD price via an API call to coinmarketcap. This value will then be saved to the blockchain Oracle.<br/>
                Please note, Update Oracle has to be done from Account 1 as this is the contract owner.<br/>
                  Click the 'Get Price From Oracle' button to retrieve the price from the Oracle and update the UI.
                </h4>
                <div><Button bsStyle="primary" onClick={this.handleUpdatePrice}>Update Oracle</Button> <Button bsStyle="primary" onClick={this.handleGetPriceFromOracle}>Get Price From Oracle</Button> </div>
                <br/><br/>
              </Panel.Body>
            </Panel>
          </Col>
        </div>
    );
  }
}
