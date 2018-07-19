//using the infura.io node, otherwise ipfs requires you to run a //daemon on your own computer/server.
const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

exports.uploadInfo = async (info) => {
  console.log('IpfsUploadingInfo...');
  const data = Buffer.from(JSON.stringify(info));
  const result = await ipfs.files.add(data);
  console.log('Info Hash: ' + result[0].hash);
  return result[0].hash;
}

exports.uploadPic = async (data) => {
  console.log('IpfsUploadingPic...');
  const buf = Buffer.from(data);                                     // Convert file data into buffer
  const result = await ipfs.add(buf);
  console.log('Pic Hash: ' + result[0].hash);
  return result[0].hash;
}

exports.getItemSpecification = async (hash) => {
  const buf = await ipfs.files.cat(`/ipfs/${hash}`);
  let spec;
  try {
    spec = JSON.parse(buf.toString());
  } catch (e) {
    throw new Error(`Could not get item specification for hash ${hash}`);
  }
  return spec;
}
