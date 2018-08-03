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
    When a user clicks Sign In and authenticates with uPort app the user info is shown. UPort Credential Name will be stored with new Item & Answer if people want to identify themselves.
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
                <Panel.Title componentClass="h3">UPort Credentials</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>Click the button to authenticate with UPort (On Rinkeby) then the DApp will display your credentials.</p>
                <p>New Items & Answers will store your credential name to identify your input.</p>
                <div><Button bsStyle="primary" onClick={this.handleUportSignin}>Get UPort Credentials</Button> </div>
                <br/><br/>
                {uportCredentials}
              </Panel.Body>
            </Panel>
          </Col>
        </div>
    );
  }
}
