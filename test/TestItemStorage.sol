pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ItemStorage.sol";

contract TestItemStorage {
  // Tests the ItemStorage contract. See TestItemStorage.js for more tests as javascript tests allow for much more functionality.
  // Truffle will send the TestContract Ether after deploying the contract.
  uint public initialBalance = 10 ether;

  ItemStorage itemStorageInstance;

  function testZeroItemCount() public {
    // When contract first deployed there should be no items.
    itemStorageInstance = new ItemStorage();

    uint expected = 0;

    Assert.equal(itemStorageInstance.getItemCount(), expected, "It should have 0 item count on deploy.");
  }

  function testItStoresAnItemWithCorrectId() public {
    // Test that storing a correct item is ok.
    bytes32 _itemDigest = "ItemDigest";
    uint8 _HashFunction = 18;
    uint8 _Size = 32;
    bytes32 _picDigest = "ThisIsThePicDigest";
    uint256 _bounty = 1 ether;

    uint itemId = itemStorageInstance.makeItem.value(1 ether)(address(this), _bounty, _itemDigest, _HashFunction, _Size, _picDigest, _HashFunction, _Size);

    uint expectedId = 1;
    Assert.equal(itemId, expectedId, "Make item did not return the correct ID.");
  }

  function testOneItemStored() public {
    uint expected = 1;
    Assert.equal(itemStorageInstance.getItemCount(), expected, "It should have 1 item.");
  }

  function testItemHasNoAnswers() public {
    uint item = 1;
    uint expected = 0;
    Assert.equal(itemStorageInstance.getItemAnswerCount(item), expected, "Item should have no answers.");
  }

  function testItemAddAnswer() public {
    uint item = 1;
    bytes32 _answerDigest = "ThisIsTheAnswer";
    uint8 _HashFunction = 18;
    uint8 _Size = 32;

    uint answerId = itemStorageInstance.addAnswer(item, _answerDigest, _HashFunction, _Size, address(this));
    uint expected = 1;
    Assert.equal(answerId, expected, "Answer ID Doesn't match");
  }

  function testItemHasOneAnswer() public {
    uint item = 1;
    uint expected = 1;
    Assert.equal(itemStorageInstance.getItemAnswerCount(item), expected, "Item should have 1 answer.");
  }
}
