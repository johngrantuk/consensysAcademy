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

  struct AnswerItem {
    bytes32 answerHash;
    address owner;
    uint256 questionId;
  }

  struct TaskItem {
    bytes32 specificationHash;
    address owner;
    bytes32 deliverableHash;
    uint256 bounty;
    bool finalized;
    bool cancelled;
    /*
    uint256 dueDate;
    uint256 payoutsWeCannotMake;
    uint256 potId;
    uint256 deliverableTimestamp;
    uint256 domainId;
    uint256[] skills;
    */

    // TODO switch this mapping to a uint8 when all role instances are uint8-s specifically ColonyFunding source
    // mapping (uint256 => Role) roles;
    // Maps a token to the sum of all payouts of it for this task
    mapping (address => uint256) totalPayouts;
    // Maps task role ids (0,1,2..) to a token amount to be paid on task completion
    mapping (uint256 => mapping (address => uint256)) payouts;
    mapping (uint256 => AnswerItem) answers;
    uint256 answerCount;
    AnswerItem acceptedAnswer;
  }

  function makeTask(bytes32 _specificationHash) public payable returns (uint256)
  {
    taskCount += 1;

    TaskItem memory task;
    task.specificationHash = _specificationHash;
    task.owner = msg.sender;
    task.bounty = msg.value;
    task.answerCount = 0;
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
  function getTask(uint256 _id) public view returns (bytes32, address, bytes32, uint256, uint256, bool, bool, bytes32) {
    TaskItem storage t = taskItems[_id];
    return (t.specificationHash, t.owner, t.deliverableHash, t.bounty, t.answerCount, t.finalized, t.cancelled, t.acceptedAnswer.answerHash);
  }
  function addAnswer(uint256 _itemId, bytes32 _answerHash) public returns (uint256){
    TaskItem storage t = taskItems[_itemId];

    t.answerCount += 1;

    AnswerItem memory answer;
    answer.answerHash = _answerHash;
    answer.owner = msg.sender;
    answer.questionId = t.answerCount;
    t.answers[t.answerCount] = answer;
    return t.answerCount;
  }
  function getAnswerCount(uint256 _itemId) public view returns (uint256) {
    TaskItem storage t = taskItems[_itemId];
    return t.answerCount;
  }
  function getAnswer(uint256 _itemId, uint256 _answerId) public view returns (bytes32, address, uint256) {
    TaskItem storage t = taskItems[_itemId];
    AnswerItem memory answer = t.answers[_answerId];
    return (answer.answerHash, answer.owner, answer.questionId);
  }
  function acceptAnswer(uint256 _itemId, uint256 _answerId) public returns (bool) {
    require(_itemId <= taskCount);
    TaskItem storage t = taskItems[_itemId];
    require(t.owner == msg.sender);
    require(t.finalized == false);
    require(_answerId <= t.answerCount);
    t.finalized = true;
    t.acceptedAnswer = t.answers[_answerId];
    t.acceptedAnswer.owner.transfer(t.bounty);
    //t.acceptedAnswer.owner.send(t.bounty);  // !!!!!!!!! https://ethereum.stackexchange.com/questions/19341/address-send-vs-address-transfer-best-practice-usage
    // emit event??

    return true;
  }

}
