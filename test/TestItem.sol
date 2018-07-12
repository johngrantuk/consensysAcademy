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

    bytes32 itemHash = "This is a hash";

    uint itemId = item.makeItem.value(1 ether)(itemHash);

    uint expected = 1;
    Assert.equal(itemId, expected, "It should have ID 1.");
  }
  function testRetreiveItem() public {

    bytes32 itemHash = "This is a hash";

    uint itemNo = 1;
    bytes32 specificationHash;

    (specificationHash, , , , , , , ) = item.getItem(itemNo);

    Assert.equal(specificationHash, itemHash, "retreivedItem should have matching hash.");
  }
  function testItemOwner() public {

    uint itemNo = 1;
    address owner;

    (, owner, , , , , , ) = item.getItem(itemNo);

    Assert.equal(this, owner, "Function caller should be the owner.");
  }
  function testItemBalance() public {

    uint itemNo = 1;
    uint256 expectedAmount = 1 ether;

    uint256 bountyAmount;

    (, , , bountyAmount, , , , ) = item.getItem(itemNo);
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
}
