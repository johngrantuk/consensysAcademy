
exports.getItems = async (Web3, ItemContract, Account) => {

  console.log('GEtItems:')

  var noItems = await ItemContract.getItemCount({from: Account});

  console.log(noItems)

  var items = [];
  var i = 1;
  var itemInfo;
  while(i < noItems.c[0] + 1){
      itemInfo = await ItemContract.getItem(i);
      console.log(itemInfo);
      console.log(Web3.toAscii(itemInfo[0]))
      i++;
      items.push({
        picLink: 'https://ipfs.io/ipfs/' + Web3.toAscii(itemInfo[8]).replace(/\0/g, ''),
        infoHash: Web3.toAscii(itemInfo[0]),
        bounty: itemInfo[3].toNumber(),
        owner: itemInfo[1],
        answerCount: itemInfo[4].toNumber(),
        finalised: itemInfo[5],
        cancelled: itemInfo[6],
        acceptedAnswerHash: Web3.toAscii(itemInfo[7]).replace(/\0/g, '')
      })
  }

  return items;
}

/*

exports.getItems = async () => {                                                                                                                    // Gets the existing holes/items stored on Colony

  const userAccount = await loader.getAccount(0);
  const userColonyClient = await getNetworkClient(userAccount);

  const count = await userColonyClient.getItemCount.call();                                                                                         // Get number of items deployed
  // console.log('Number of items deployed: ' + count.count);

  var holes = [];

  if(count.count == 0){
    holes.push({id: uuid.v4(), manager: 'No Recorded Holes', location: {lat: 0, lng: 0}, comment: 'Go On Be The First!', subdomain: 0, date: new Date().toLocaleString() })
  }

  await ecp.init();

  var i = 1;
  while(i < count.count + 1){                                                                                                                         // Gets each item and pushes to array for GUI use
    var itemHash = await userColonyClient.getItem.call({ itemId:i });                                                                                 // Gets Item hash

    if(itemHash.specificationHash == null){
      // console.log('Weird science...')
      i++;
      continue;
    }

    var itemInfo = await ecp.getItemSpecification(itemHash.specificationHash);                                                                          // Get IPFS data
    var roleInfo = await userColonyClient.getItemRole.call({ itemId: i, role: 'MANAGER' });                                                             // This is the account that recorded hole

    holes.push({id: i, location: itemInfo.location, comment: itemInfo.comment, subdomain: itemInfo.subdomain, date: itemInfo.date, manager: roleInfo.address, isRepaired: itemInfo.isRepaired, isConfirmed: itemInfo.isConfirmed, rating: itemInfo.rating });
    i++;
  }

  await ecp.stop();
  return holes;
};
*/
