// This is what will become a part of ColonyJS - The Extended Colony Protocol

// It will make the Colony Network more human usable with functionality for
// non-consensus-relevant contexts by enriching the data stored on chain with
// metadata (which might be too expensive to store on chain).
// It helps developers building on the Colony Network provide a web 2.0 like
// user experience, without compromising decentralisation.

const IPFS = require('ipfs');
const { Buffer } = require('buffer');
var Promise = require('promise');

let node;

const waitForIPFS = () => {
  node = new IPFS({ start: false });
  return new Promise((resolve, reject) => {
    node.on('ready', () => resolve(true));
    node.on('error', err => reject(err));
  })
};

exports.uploadPic = async (data) => {
  console.log('buffer')
  console.log(data)
  const buf = Buffer.from(data)                  // Convert data into buffer
  //const buf = Buffer.from('This is johns test')                  // Convert data into buffer
  console.log('buffer done')
  //const result = await node.files.add(buf);
  const result = await node.files.add({
          path: 'johnspic.jpg',
          content: buf});
  console.log(result)
  return result[0].hash;
  /*
  node.files.add(buf, (err, result) => {    // Upload buffer to IPFS
    if(err) {
      console.error(err)
      return
    }
    let url = `https://ipfs.io/ipfs/${result[0].hash}`
    console.log(`Url --> ${url}`)
    return result[0].hash;
    // document.getElementById("url").innerHTML= url
    // document.getElementById("url").href= url
    // document.getElementById("output").src = url
  })
  */
}

exports.init = async () => {
  await waitForIPFS();
  return node.start();
}

exports.saveItemSpecification = async (spec) => {
  const data = Buffer.from(JSON.stringify(spec));
  const result = await node.files.add(data);
  return result[0].hash;
}

exports.getItemSpecification = async (hash) => {
  const buf = await node.files.cat(`/ipfs/${hash}`);
  let spec;
  try {
    spec = JSON.parse(buf.toString());
  } catch (e) {
    throw new Error(`Could not get item specification for hash ${hash}`);
  }
  return spec;
}

exports.stop = () => node.stop();
