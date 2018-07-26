pragma solidity ^0.4.23;

import "./ItemInterface.sol";
import "./ItemStorage.sol";

contract Parent {

  event ItemContractCreated(address item, uint now);
  event ItemContractUpgraded(address item, uint now);

  mapping(bytes32 => address) public itemContracts;

  function registerItem(bytes32 key_, address itemAddress) public
  {
    ItemStorage itemStorage = new ItemStorage();
    // Set the calling user as the first colony admin
    // eternalStorage.addAdmin(msg.sender);

    ItemInterface(itemAddress).setDataStore(itemStorage);
    // Set the item contract as the storage owner
    //itemStorage.changeOwner(itemAddress);

    itemContracts[key_] = itemAddress;
    emit ItemContractCreated(itemAddress, now);
  }

  function getItemContractAddress(bytes32 key_) public constant returns (address)
  {
    return itemContracts[key_];
  }

  function upgradeItemContract(bytes32 key_, address newItemAddress) public
  {
    address itemContractAddress = itemContracts[key_];
    address itemStorage = ItemInterface(itemContractAddress).itemStorage();
    //address itemStorage = itemContractAddress.itemStorage();

    ItemInterface(newItemAddress).setDataStore(itemStorage);

    ItemInterface(itemContractAddress).kill(newItemAddress);

    itemContracts[key_] = newItemAddress;
    emit ItemContractUpgraded(newItemAddress, now);
  }
}
