
exports.getItems = async (Web3, ItemContract, Account) => {

  console.log('GEtItems:')

  var noItems = await ItemContract.getTaskCount({from: Account});

  console.log(noItems)

  var items = [];
  var i = 1;
  var itemInfo;
  while(i < noItems.c[0] + 1){
      itemInfo = await ItemContract.getTask(i);
      console.log(itemInfo);
      console.log(Web3.toAscii(itemInfo[0]))
      i++;
      items.push({name: Web3.toAscii(itemInfo[0])})
  }

  return items;
}

/*

exports.getTasks = async () => {                                                                                                                    // Gets the existing holes/tasks stored on Colony

  const userAccount = await loader.getAccount(0);
  const userColonyClient = await getNetworkClient(userAccount);

  const count = await userColonyClient.getTaskCount.call();                                                                                         // Get number of tasks deployed
  // console.log('Number of tasks deployed: ' + count.count);

  var holes = [];

  if(count.count == 0){
    holes.push({id: uuid.v4(), manager: 'No Recorded Holes', location: {lat: 0, lng: 0}, comment: 'Go On Be The First!', subdomain: 0, date: new Date().toLocaleString() })
  }

  await ecp.init();

  var i = 1;
  while(i < count.count + 1){                                                                                                                         // Gets each task and pushes to array for GUI use
    var taskHash = await userColonyClient.getTask.call({ taskId:i });                                                                                 // Gets Task hash

    if(taskHash.specificationHash == null){
      // console.log('Weird science...')
      i++;
      continue;
    }

    var taskInfo = await ecp.getTaskSpecification(taskHash.specificationHash);                                                                          // Get IPFS data
    var roleInfo = await userColonyClient.getTaskRole.call({ taskId: i, role: 'MANAGER' });                                                             // This is the account that recorded hole

    holes.push({id: i, location: taskInfo.location, comment: taskInfo.comment, subdomain: taskInfo.subdomain, date: taskInfo.date, manager: roleInfo.address, isRepaired: taskInfo.isRepaired, isConfirmed: taskInfo.isConfirmed, rating: taskInfo.rating });
    i++;
  }

  await ecp.stop();
  return holes;
};
*/
