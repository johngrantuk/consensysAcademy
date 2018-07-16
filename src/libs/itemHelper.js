import { getMultihashFromBytes32 } from './multihash';
const ipfsHelper = require('./ipfsHelper');

exports.getItems = async (Web3, ItemContract, Account) => {
  var noItems = await ItemContract.getItemCount({from: Account});
  var items = [];
  var i = 1;
  while(i < noItems.c[0] + 1){
      i++;
      let hash = await ItemContract.getItem.call(1, {from: Account});
      let specHashDigest = hash[0];
      let specHashfunction = hash[1].toNumber();
      let specHashSize = hash[2].toNumber();
      let owner = hash[3];
      let bounty = hash[4].toNumber();
      let finalised = hash[5];
      let cancelled = hash[6];
      let specHash = getMultihashFromBytes32(specHashDigest, specHashfunction, specHashSize);
      let info = await ipfsHelper.getItemSpecification(specHash);
      console.log(info);
      /*hash = await ItemContract.getItemPicHash.call(1, {from: Account});
      let picHashDigest = hash[0];
      let picHashfunction = hash[1].toNumber();
      let picHashSize = hash[2].toNumber();
      let picHash = getMultihashFromBytes32(picHashDigest, picHashfunction, picHashSize);
      */
      items.push({
        id: info.id,
        date: info.date,
        info: info.info,
        picLink: 'https://ipfs.io/ipfs/' + info.picHash,
        infoHash: specHash,
        bounty: bounty,
        owner: owner,
        finalised: finalised,
        cancelled: cancelled
      })
  }

  return items;
}
