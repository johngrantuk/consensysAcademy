pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ItemUpgradeable.sol";

contract TestItemUpgradeable {
  // Truffle will send the TestContract Ether after deploying the contract.
  uint public initialBalance = 10 ether;

  ItemUpgradeable itemInstance;

  function testZeroItemCount() public {
    itemInstance = ItemUpgradeable(DeployedAddresses.ItemUpgradeable());

    uint expected = 0;

    Assert.equal(itemInstance.getItemCount(), expected, "It should have 0 item count on deploy.");
  }
  function testItStoresAnItem() public {

    bytes32 _itemDigest = "ItemDigest";
    uint8 _HashFunction = 18;
    uint8 _Size = 32;
    bytes32 _picDigest = "ThisIsThePicDigest";

    uint itemId = itemInstance.makeItem.value(1 ether)(_itemDigest, _HashFunction, _Size, _picDigest, _HashFunction, _Size);

    uint expected = 1;
    Assert.equal(itemId, expected, "ItemDigest");
  }
  function testOneItemStored() public {
    uint expected = 1;
    Assert.equal(itemInstance.getItemCount(), expected, "It should have 1 item.");
  }
  function testItemHasNoAnswers() public {
    uint item = 1;
    uint expected = 0;
    Assert.equal(itemInstance.getItemAnswerCount(item), expected, "Item should have no answers.");
  }
  function testItemAddAnswer() public {
    uint item = 1;
    bytes32 _answerDigest = "ThisIsTheAnswer";
    uint8 _HashFunction = 18;
    uint8 _Size = 32;

    uint answerId = itemInstance.addAnswer(item, _answerDigest, _HashFunction, _Size);
    uint expected = 1;
    Assert.equal(answerId, expected, "Answer ID Doesn't match");
  }
}
