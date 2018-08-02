pragma solidity ^0.4.23;

import "./ItemInterface.sol";
import "./ItemStorage.sol";
import { Ownable } from 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import { Destructible } from 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract Parent is Ownable, Destructible {
  /*
  This is part of the upgradeable design.
  Parent contract is responsible for managing Item contracts which are upgradeable and use permanent storage from ItemStorage contract.
  See:
  https://blog.colony.io/writing-upgradeable-contracts-in-solidity-6743f0eecc88
  https://medium.com/@nrchandan/interfaces-make-your-solidity-contracts-upgradeable-74cd1646a717
  */
  event ItemContractCreated(address item, uint now);
  event ItemContractUpgraded(address item, uint now);

  mapping(bytes32 => address) public itemContracts;

  // This maps the Item contract to a particular key & sets it's data store.
  function registerItem(bytes32 key_, address itemAddress) public
  onlyOwner()
  {
    ItemStorage itemStorage = new ItemStorage();

    ItemInterface(itemAddress).setDataStore(itemStorage);

    itemContracts[key_] = itemAddress;
    emit ItemContractCreated(itemAddress, now);
  }

  // Returns Item contract address mapped to key
  function getItemContractAddress(bytes32 key_) public constant
  returns (address)
  {
    return itemContracts[key_];
  }

  // Upgrades contract mapped to key_ with new Item contract address
  function upgradeItemContract(bytes32 key_, address newItemAddress) public
  onlyOwner()
  {
    address itemContractAddress = itemContracts[key_];
    address itemStorage = ItemInterface(itemContractAddress).itemStorageAddr();

    ItemInterface(newItemAddress).setDataStore(itemStorage);

    ItemInterface(itemContractAddress).kill(newItemAddress);

    itemContracts[key_] = newItemAddress;
    emit ItemContractUpgraded(newItemAddress, now);
  }

  // Uses circuit breaker to pause storage functionality but still allow items to be cancelled and bounty refunded
  function toggleItemStorageActive(bytes32 key_) public
  onlyOwner()
  {
    address itemContractAddress = itemContracts[key_];
    address itemStorageAddress = ItemInterface(itemContractAddress).itemStorageAddr();

    ItemStorage itemStore = ItemStorage(itemStorageAddress);

    itemStore.toggle_active();
  }

  function kill(address transferAddress_) public
  {
    destroyAndSend(transferAddress_);
  }
}
