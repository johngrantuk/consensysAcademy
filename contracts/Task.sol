/*
  This file is part of The Colony Network.

  The Colony Network is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  The Colony Network is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with The Colony Network. If not, see <http://www.gnu.org/licenses/>.
*/

pragma solidity ^0.4.23;

contract Task {

  event TaskAdded(uint256 indexed id);

  mapping (uint256 => TaskItem) taskItems;
  uint256 taskCount;

  struct TaskItem {
    bytes32 specificationHash;
    bytes32 deliverableHash;
    bool finalized;
    bool cancelled;
    uint256 dueDate;
    uint256 payoutsWeCannotMake;
    uint256 potId;
    uint256 deliverableTimestamp;
    uint256 domainId;
    uint256[] skills;

    // TODO switch this mapping to a uint8 when all role instances are uint8-s specifically ColonyFunding source
    // mapping (uint256 => Role) roles;
    // Maps a token to the sum of all payouts of it for this task
    mapping (address => uint256) totalPayouts;
    // Maps task role ids (0,1,2..) to a token amount to be paid on task completion
    mapping (uint256 => mapping (address => uint256)) payouts;
  }


  function makeTask(bytes32 _specificationHash) public returns (uint256)
  {
    taskCount += 1;

    TaskItem memory task;
    task.specificationHash = _specificationHash;
    taskItems[taskCount] = task;
    //tasks[taskCount].roles[MANAGER] = Role({
    //  user: msg.sender,
    //  rated: false,
    //  rating: 0
    //});
    emit TaskAdded(taskCount);
    return taskCount;
  }

  function getTaskCount() public view returns (uint256) {
    return taskCount;
  }

  // Submit info to Task

  // Close Task/Payout Bounty

  //Get Task
  function getTask(uint256 _id) public view returns (bytes32, bytes32, bool, bool, uint256, uint256, uint256, uint256, uint256, uint256[]) {
    TaskItem storage t = taskItems[_id];
    return (t.specificationHash, t.deliverableHash, t.finalized, t.cancelled, t.dueDate, t.payoutsWeCannotMake, t.potId, t.deliverableTimestamp, t.domainId, t.skills);
  }

}
