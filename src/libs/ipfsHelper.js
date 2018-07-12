//using the infura.io node, otherwise ipfs requires you to run a //daemon on your own computer/server.
const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

//run with local daemon
// const ipfsApi = require(‘ipfs-api’);
// const ipfs = new ipfsApi(‘localhost’, ‘5001’, {protocol:‘http’});

/*
      await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        console.log(err,ipfsHash);
        //setState by setting ipfsHash to ipfsHash[0].hash
        this.setState({ ipfsHash:ipfsHash[0].hash });
   // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract
  //return the transaction hash from the ethereum contract
 //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send

        storehash.methods.sendHash(this.state.ipfsHash).send({
          from: accounts[0]
        }, (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({transactionHash});
        }); //storehash
      }) //await ipfs.add
    }; //onSubmit


*/

exports.uploadPic = async (data) => {

  const buf = Buffer.from(data)                                     // Convert file data into buffer

  console.log('before')
  const result = await ipfs.add(buf);
  console.log('after')
  console.log(result[0].hash)
  return result[0].hash;
  /*
  const result = await ipfs.add(buf, updateLink, (err, ipfsHash) => {
    console.log('IPFS result: ')
    console.log(err)
    console.log(ipfsHash);
    return ipfsHash[0].hash;
  })
  */
}
