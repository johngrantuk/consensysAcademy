import React from 'react';
import { Button, Col, Panel } from 'react-bootstrap';
import { Connect, SimpleSigner } from 'uport-connect';

const uport = new Connect('ConsenSys Project', {
  clientId: '2oqjYpdVAREujwR2J6zEYgz9XNvn1jdqNQQ',
  network: 'rinkeby',
  signer: SimpleSigner('310f9a80e477daeac5b43889bc174db19e1fdc307fb412402649c8b81e365f4d')
})

export default class Uport extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      uport: false,
      uportMessage: '',
    };                                                                                 // Load all the existing data from Colony
  }

  handleUportSignin = () => {
    /*
    At the moment this is just showing that I can integrate with uPort. When a user clicks Sign In and authenticates with uPort app the user info is shown.
    In the future using uPort seems like a nice way to authenticate users on a live network.
    */
    uport.requestCredentials({requested: ['name', 'avatar', 'phone', 'country']}).then((credentials) => {
      console.log(credentials)
      this.setState({
        uportMessage: credentials.name + ' has signed in.',
        avatarLink: credentials.avatar.uri,
        country: credentials.country,
        phone: credentials.phone,
        key: credentials.publicKey,
        uport: true
      });
      this.props.handleUportInfo(credentials);
    })
  }

  render() {

    let uportCredentials;

    if(this.state.uport){
      uportCredentials =
      <div>
        <strong>{this.state.uportMessage}</strong><br/>
        <strong>Public Key: </strong>: <span>{this.state.key}</span><br/>
        <strong>Country: </strong>: <span>{this.state.country}</span><br/>
        <strong>Phone: </strong>: <span>{this.state.phone}</span><br/>
        <img role="presentation" style={{"width" : "100%"}} src={this.state.avatarLink}/>
      </div>
    }

    return (
        <div>
          <Col sm={12} md={12} lg={12}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">UPort Function</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <h4>This demonstrates UPort integration. Click the button to authenticate with UPort (On Rinkeby) then the DApp will display your credentials.</h4>
                <div><Button bsStyle="primary" onClick={this.handleUportSignin}>UPort Credentials</Button> </div>
                <br/><br/>
                {uportCredentials}
              </Panel.Body>
            </Panel>
          </Col>
        </div>
    );
  }
}
/*
    import { Connect, SimpleSigner } from 'uport-connect'

    const uport = new Connect('JG\'s new app', {
      clientId: '2oqjYpdVAREujwR2J6zEYgz9XNvn1jdqNQQ',
      network: 'rinkeby or ropsten or kovan',
      signer: SimpleSigner('310f9a80e477daeac5b43889bc174db19e1fdc307fb412402649c8b81e365f4d')
    })

    // Request credentials to login
    uport.requestCredentials({
      requested: ['name', 'phone', 'country'],
      notifications: true // We want this if we want to recieve credentials
    })
    .then((credentials) => {
      // Do something
    })

    // Attest specific credentials
    uport.attestCredentials({
      sub: THE_RECEIVING_UPORT_ADDRESS,
      claim: {
        CREDENTIAL_NAME: CREDENTIAL_VALUE
      },
      exp: new Date().getTime() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    })
    */
