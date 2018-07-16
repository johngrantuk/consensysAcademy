pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Item.sol";

contract TestItem {
  // Truffle will send the TestContract one Ether after deploying the contract.
  uint public initialBalance = 10 ether;

  Item item;

  function testZeroItemCount() public {
    item = Item(DeployedAddresses.Item());

    uint expected = 0;

    Assert.equal(item.getItemCount(), expected, "It should have 0 item count on deploy.");
  }
  function testItStoresAItem() public {

    bytes32 _itemDigest = "ItemDigest";
    uint8 _HashFunction = 18;
    uint8 _Size = 32;
    bytes32 _picDigest = "ThisIsThePicDigest";

    uint itemId = item.makeItem.value(1 ether)(_itemDigest, _HashFunction, _Size, _picDigest, _HashFunction, _Size);

    uint expected = 1;
    Assert.equal(itemId, expected, "ItemDigest");
  }
/*
  function testRetreiveItem() public {

    bytes32 _itemDigest = "ThisIsTheItemDigest";
    uint8 _HashFunction = 1;
    uint8 _Size = 1;
    bytes32 _picDigest = "ThisIsThePicDigest";

    uint itemNo = 1;
    bytes32 itemDigest;
    uint8 itemHashFunction;
    uint8 itemSize = 2;
    bytes32 picDigest;
    uint8 picHashFunction;
    uint8 picSize;

    //(itemDigest, itemHashFunction , itemSize, picDigest, picHashFunction, picSize, , , , , , ,) = item.getItem(itemNo);
    (itemDigest, itemHashFunction , itemSize) = item.getItemSpecHash(itemNo);

    Assert.equal(itemDigest, _itemDigest, "Item digest should match");
    Assert.equal(itemHashFunction, _HashFunction, "itemHashFunction should match");
    Assert.equal(itemSize, _Size, "Item Size should match");

    Assert.equal(picDigest, _picDigest, "Pic digest should match");
    Assert.equal(picHashFunction, _HashFunction, "picHashFunction should match");
    Assert.equal(picSize, _Size, "PicSize should match");


  }

  function testItemOwner() public {

    uint itemNo = 1;
    address owner;

    (, owner, , , , , , ,) = item.getItem(itemNo);

    Assert.equal(this, owner, "Function caller should be the owner.");
  }
  function testItemBalance() public {

    uint itemNo = 1;
    uint256 expectedAmount = 1 ether;

    uint256 bountyAmount;

    (, , , bountyAmount, , , , ,) = item.getItem(itemNo);
    //address(this).balance

    Assert.equal(expectedAmount, bountyAmount, "Bounty amount should be 1ether.");
  }
  function testGetItemCount() public {
    uint expected = 1;
    Assert.equal(item.getItemCount(), expected, "It should have 1 item count.");
  }
  function testAnswerCountOnInitial() public {
    uint itemNo = 1;
    uint expected = 0;
    Assert.equal(item.getItemAnswerCount(itemNo), expected, "It should have 0 answers initially.");
  }
  function testAddAnswer() public {
    uint itemNo = 1;
    uint expected = 1;
    uint answerId;
    answerId = item.addAnswer(itemNo, "Answer No 1");
    Assert.equal(expected, answerId, "It should have 1 answer.");
  }
  function testGetAnswer() public {
    uint itemNo = 1;
    uint answerNo = 1;

    address owner;
    bytes32 answerHash;
    uint256 questionId;

    (answerHash, owner, questionId) = item.getAnswer(itemNo, answerNo);
    Assert.equal(answerHash, "Answer No 1", "Answer hash should match");
  }
  // Accept answer test no item, already accepted, non-owner, bounty transfer
  */
}
