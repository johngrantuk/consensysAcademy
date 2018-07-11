pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Task.sol";

contract TestTask {
  // Truffle will send the TestContract one Ether after deploying the contract.
  uint public initialBalance = 10 ether;

  Task task;

  function testZeroTaskCount() public {
    task = Task(DeployedAddresses.Task());

    uint expected = 0;

    Assert.equal(task.getTaskCount(), expected, "It should have 0 task count on deploy.");
  }
  function testItStoresATask() public {

    bytes32 taskHash = "This is a hash";

    uint taskId = task.makeTask.value(1 ether)(taskHash);

    uint expected = 1;
    Assert.equal(taskId, expected, "It should have ID 1.");
  }
  function testRetreiveTask() public {

    bytes32 taskHash = "This is a hash";

    uint taskNo = 1;
    bytes32 specificationHash;

    (specificationHash, , , , , , , ) = task.getTask(taskNo);

    Assert.equal(specificationHash, taskHash, "retreivedTask should have matching hash.");
  }
  function testTaskOwner() public {

    uint taskNo = 1;

    bytes32 specificationHash;
    address owner;
    bytes32 deliverableHash;
    uint256 bountyAmount;
    uint256 answerCount;
    bool finalised;
    bool cancelled;
    bytes32 answerHash;
    uint256 questionId;

    (, owner, , , , , , ) = task.getTask(taskNo);
    //address(this).balance

    Assert.equal(this, owner, "Function caller should be the owner.");
  }
  function testTaskBalance() public {

    uint taskNo = 1;
    uint256 expectedAmount = 1 ether;

    uint256 bountyAmount;

    (, , , bountyAmount, , , , ) = task.getTask(taskNo);
    //address(this).balance

    Assert.equal(expectedAmount, bountyAmount, "Bounty amount should be 1ether.");
  }
  function testGetTaskCount() public {
    uint expected = 1;
    Assert.equal(task.getTaskCount(), expected, "It should have 1 task count.");
  }
  function testAnswerCountOnInitial() public {
    uint taskNo = 1;
    uint expected = 0;
    Assert.equal(task.getAnswerCount(taskNo), expected, "It should have 0 answers initially.");
  }
  function testAddAnswer() public {
    uint taskNo = 1;
    uint expected = 1;
    uint answerId;
    answerId = task.addAnswer(taskNo, "Answer No 1");
    Assert.equal(expected, answerId, "It should have 1 answer.");
  }
  function testGetAnswer() public {
    uint taskNo = 1;
    uint answerNo = 1;

    address owner;
    bytes32 answerHash;
    uint256 questionId;

    (answerHash, owner, questionId) = task.getAnswer(taskNo, answerNo);
    Assert.equal(answerHash, "Answer No 1", "Answer hash should match");
  }
  // Accept answer test no task, already accepted, non-owner, bounty transfer
}
