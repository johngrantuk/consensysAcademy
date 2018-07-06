const IPFS = require('ipfs')
var async = require('async')

const node = new IPFS()

async.series([
  (cb) => node.on('ready', cb),
  (cb) => node.version((err, version) => {
    if (err) { return cb(err) }
    console.log('Version:', version.version)
    cb()
  }),
  (cb) => node.files.add({
    path: 'hello.txt',
    content: Buffer.from('Hello World')
  }, (err, filesAdded) => {
    if (err) { return cb(err) }

    // Once the file is added, we get back an object containing the path, the
    // multihash and the sie of the file
    console.log('\nAdded file:', filesAdded[0].path, filesAdded[0].hash)
    fileMultihash = filesAdded[0].hash
    cb()
  })
])
