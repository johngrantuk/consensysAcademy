pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Task.sol";

contract TestTask {

  Task task;

  function testZeroTaskCount() public {
    task = Task(DeployedAddresses.Task());

    uint expected = 0;

    Assert.equal(task.getTaskCount(), expected, "It should have 0 task count on deploy.");
  }
  function testItStoresATask() public {

    bytes32 taskHash = "This is a hash";

    uint taskId = task.makeTask(taskHash);

    uint expected = 1;
    Assert.equal(taskId, expected, "It should have ID 1.");
  }
  function testRetreiveTask() public {

    bytes32 taskHash = "This is a hash";

    uint taskNo = 1;

    bytes32 specificationHash;

    (specificationHash, , , , , , , , ,) = task.getTask(taskNo);

    Assert.equal(specificationHash, taskHash, "retreivedTask should have matching hash.");
  }
  function testGetTaskCount() public {
    uint expected = 1;
    Assert.equal(task.getTaskCount(), expected, "It should have 1 task count.");
  }
}
