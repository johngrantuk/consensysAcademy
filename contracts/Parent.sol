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

  // Emitted when an Item contract is registered
  event ItemContractCreated(address item, uint now);
  // Emitted when the Item contract is upgraded
  event ItemContractUpgraded(address item, uint now);
  // Stored itemContracts address
  mapping(bytes32 => address) public itemContracts;

  /** @dev This maps the Item contract to a particular key & sets it's data store.
  * @param key_ bytes32 ID/Key of Item.
  * @param itemAddress address Address of Item contract
  */
  function registerItem(bytes32 key_, address itemAddress) public
  onlyOwner()
  {
    ItemStorage itemStorage = new ItemStorage();

    ItemInterface(itemAddress).setDataStore(itemStorage);

    itemContracts[key_] = itemAddress;
    emit ItemContractCreated(itemAddress, now);
  }

  /** @dev Returns Item contract address mapped to key
  * @param key_ bytes32 ID/Key of Item.
  * @return address Address of Item contract at key.
  */
  function getItemContractAddress(bytes32 key_) public constant
  returns (address)
  {
    return itemContracts[key_];
  }

  /** @dev Upgrades contract mapped to key_ with new Item contract address
  * @param key_ bytes32 ID/Key of Item.
  * @param newItemAddress address Address of new Item contract
  */
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

  /** @dev Uses circuit breaker to pause storage functionality but still allow items to be cancelled and bounty refunded
  * @param key_ bytes32 ID/Key of Item.
  */
  function toggleItemStorageActive(bytes32 key_) public
  onlyOwner()
  {
    address itemContractAddress = itemContracts[key_];
    address itemStorageAddress = ItemInterface(itemContractAddress).itemStorageAddr();

    ItemStorage itemStore = ItemStorage(itemStorageAddress);

    itemStore.toggle_active();
  }

  /** @dev Kills contract and sends remaining Ether to address.
  * @param transferAddress_ address Address remaining Ether will be sent to.
  */
  function kill(address transferAddress_) public
  {
    destroyAndSend(transferAddress_);
  }
}
