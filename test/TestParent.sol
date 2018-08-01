pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ItemInterface.sol";
import "../contracts/Parent.sol";
import "../contracts/ItemUpgradeable.sol";

contract TestParent {

  uint public initialBalance = 10 ether;

  Parent parentInstance;
  address originalStorageAddress;

  function testInitialRegisterItemContract() public {
    // Registers the ItemUpgradeable contract & sets it's data store.
    parentInstance = new Parent();
    ItemUpgradeable item = new ItemUpgradeable();

    bytes32 id = 1;
    parentInstance.registerItem(id, address(item));
    address test;
    test = parentInstance.getItemContractAddress(id);

    originalStorageAddress = item.itemStorageAddr();

    Assert.equal(test, address(item), "New deployed contract address not correct.");
  }

  function testCreateItemOnInitial() public {
    // This creates an item using the registered contract. Tests the makeItem function but also sets the Item in the Storage contracts storage for future tests.
    bytes32 _itemDigest = "ItemDigest";
    uint8 _HashFunction = 18;
    uint8 _Size = 32;
    bytes32 _picDigest = "ThisIsThePicDigest";
    uint256 _bounty = 1 ether;

    address itemAddress;
    itemAddress = parentInstance.getItemContractAddress(1);

    ItemUpgradeable itemInstance = ItemUpgradeable(itemAddress);

    uint itemId = itemInstance.makeItem.value(_bounty)(_itemDigest, _HashFunction, _Size, _picDigest, _HashFunction, _Size);

    uint expectedId = 1;
    Assert.equal(itemId, expectedId, "Make item did not return the correct ID.");
  }

  function testItemCount() public {
    address itemAddress;
    itemAddress = parentInstance.getItemContractAddress(1);

    ItemUpgradeable itemInstance = ItemUpgradeable(itemAddress);

    uint expected = 1;
    Assert.equal(itemInstance.getItemCount(), expected, "Storage should have 1 item.");
  }

  function testUpgradeItem() public {
    // This upgrades the registered item contract to a new contract.
    address originalItemContractAddress;
    originalItemContractAddress = parentInstance.getItemContractAddress(1);

    ItemUpgradeable newItemInstance = new ItemUpgradeable();

    bytes32 id = 1;

    parentInstance.upgradeItemContract(id, address(newItemInstance));

    address newItemContractAddress;
    newItemContractAddress = parentInstance.getItemContractAddress(1);

    Assert.equal(newItemContractAddress, address(newItemInstance), "New deployed Item contract address not correct.");
    Assert.notEqual(newItemContractAddress, originalItemContractAddress, "New deployed Item contract should be different than original.");
  }

  function testNewItemStorageAddress() public {
    // Upgraded Item contract should still use original storage.
    address itemAddress;
    itemAddress = parentInstance.getItemContractAddress(1);

    ItemUpgradeable itemInstance = ItemUpgradeable(itemAddress);

    address storageAddress;
    storageAddress = itemInstance.itemStorageAddr();
    Assert.equal(originalStorageAddress, storageAddress, "Upgraded contract should have same storage address.");
  }

  function testOriginalItemExists() public {
    // Confirm the new Item contract can still access the Item created by original Item contract.
    address itemAddress;
    itemAddress = parentInstance.getItemContractAddress(1);

    ItemUpgradeable itemInstance = ItemUpgradeable(itemAddress);

    uint expected = 1;

    Assert.equal(itemInstance.getItemCount(), expected, "Upgraded contract should still have one item.");
  }

  /*
    function testCreateItemOnNew() public {
      // This creates an item using the new Item contract.
      bytes32 _itemDigest = "ItemDigest";
      uint8 _HashFunction = 18;
      uint8 _Size = 32;
      bytes32 _picDigest = "ThisIsThePicDigest";
      uint256 _bounty = 1 ether;

      address itemAddress;
      itemAddress = parentInstance.getItemContractAddress(1);

      ItemUpgradeable itemInstance = ItemUpgradeable(itemAddress);

      uint itemId = ItemInterface(itemAddress).makeItem.value(1 ether)(_itemDigest, _HashFunction, _Size, _picDigest, _HashFunction, _Size);
      //uint itemId = itemInstance.makeItem.value(1 ether)(_itemDigest, _HashFunction, _Size, _picDigest, _HashFunction, _Size);

      uint expectedId = 2;

      Assert.equal(itemId, expectedId, "Make item did not return the correct ID.");
    }

    function testNewItemCount() public {
      address itemAddress;
      itemAddress = parentInstance.getItemContractAddress(1);

      ItemUpgradeable itemInstance = ItemUpgradeable(itemAddress);

      uint expected = 2;
      Assert.equal(itemInstance.getItemCount(), expected, "Storage should have 2 items.");
    }
    */
}
