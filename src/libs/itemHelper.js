import { getMultihashFromBytes32 } from './multihash';
const ipfsHelper = require('./ipfsHelper');

exports.getItems = async (Web3, ItemContract, Account) => {
  var noItems = await ItemContract.getItemCount({from: Account});
  var items = [];
  var i = 1;
  while(i < noItems.toNumber() + 1){
      let hash = await ItemContract.getItem.call(i, {from: Account});
      let specHashDigest = hash[0];
      let specHashfunction = hash[1].toNumber();
      let specHashSize = hash[2].toNumber();
      let owner = hash[3];
      let bounty = hash[4].toNumber();
      let finalised = hash[5];
      let cancelled = hash[6];
      let specHash = getMultihashFromBytes32(specHashDigest, specHashfunction, specHashSize);
      let info = await ipfsHelper.getItemSpecification(specHash);
      let noAnswers = hash[7].toNumber();
      let isBountyCollected = hash[8];

      items.push({
        id: info.id,
        itemNo: i,
        date: info.date,
        info: info.info,
        picLink: 'https://ipfs.io/ipfs/' + info.picHash,
        infoHash: specHash,
        bounty: bounty,
        bountyEth: Web3.fromWei(bounty, 'ether'),
        owner: owner,
        finalised: finalised,
        cancelled: cancelled,
        noAnswers: noAnswers,
        isBountyCollected: isBountyCollected,
        uportName: info.uportName
      })
      i++;
  }

  return items;
}

exports.getItemAnswers = async (ItemContract, Account, ItemNo) => {
  let hash = await ItemContract.getItem.call(ItemNo, {from: Account});
  let noAnswers = hash[7].toNumber();
  var answers = [];
  var i = 1;

  while(i < noAnswers + 1){
    hash = await ItemContract.getAnswer.call(ItemNo, i, {from: Account});
    let answerHashDigest = hash[0];
    let answerHashfunction = hash[1].toNumber();
    let answerHashSize = hash[2].toNumber();
    let answerOwner = hash[3];
    // let itemId = hash[4].toNumber();
    let output = getMultihashFromBytes32(answerHashDigest, answerHashfunction, answerHashSize);

    let info = await ipfsHelper.getItemSpecification(output);

    answers.push({
      id: info.id,
      itemNo: ItemNo,
      answerNo: i,
      owner: answerOwner,
      date: info.date,
      answer: info.answer,
      uportName: info.uportName
    })
    i++;
  }

  return answers;
}

exports.getItemAnswer = async (ItemContract, Account, ItemNo) => {
  let hash = await ItemContract.getAcceptedAnswer.call(ItemNo, {from: Account});
  let answerHashDigest = hash[0];
  let answerHashfunction = hash[1].toNumber();
  let answerHashSize = hash[2].toNumber();

  let answerHash = getMultihashFromBytes32(answerHashDigest, answerHashfunction, answerHashSize);

  let info = await ipfsHelper.getItemSpecification(answerHash);

  return info;
}
