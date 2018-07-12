pragma solidity ^0.4.23;

contract Item {

  event ItemAdded(uint256 indexed id);

  mapping (uint256 => ItemStruct) itemItems;
  uint256 itemCount;

  struct AnswerItem {
    bytes32 answerHash;
    address owner;
    uint256 questionId;
  }

  struct ItemStruct {
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
    // Maps a token to the sum of all payouts of it for this item
    mapping (address => uint256) totalPayouts;
    // Maps item role ids (0,1,2..) to a token amount to be paid on item completion
    mapping (uint256 => mapping (address => uint256)) payouts;
    mapping (uint256 => AnswerItem) answers;
    uint256 answerCount;
    AnswerItem acceptedAnswer;
  }

  function makeItem(bytes32 _specificationHash) public payable returns (uint256)
  {
    itemCount += 1;

    ItemStruct memory item;
    item.specificationHash = _specificationHash;
    item.owner = msg.sender;
    item.bounty = msg.value;
    item.answerCount = 0;
    itemItems[itemCount] = item;
    item.finalized = false;
    item.cancelled = false;
    //items[itemCount].roles[MANAGER] = Role({
    //  user: msg.sender,
    //  rated: false,
    //  rating: 0
    //});
    emit ItemAdded(itemCount);
    return itemCount;
  }

  function getItemCount() public view returns (uint256) {
    return itemCount;
  }

  // Submit info to Item

  // Close Item/Payout Bounty

  //Get Item
  function getItem(uint256 _id) public view returns (bytes32, address, bytes32, uint256, uint256, bool, bool, bytes32) {
    require(itemCount > 0);
    require(_id <= itemCount);
    ItemStruct storage t = itemItems[_id];
    return (t.specificationHash, t.owner, t.deliverableHash, t.bounty, t.answerCount, t.finalized, t.cancelled, t.acceptedAnswer.answerHash);
  }
  function addAnswer(uint256 _itemId, bytes32 _answerHash) public returns (uint256){
    ItemStruct storage t = itemItems[_itemId];

    t.answerCount += 1;

    AnswerItem memory answer;
    answer.answerHash = _answerHash;
    answer.owner = msg.sender;
    answer.questionId = t.answerCount;
    t.answers[t.answerCount] = answer;
    return t.answerCount;
  }
  function getItemAnswerCount(uint256 _itemId) public view returns (uint256) {
    ItemStruct storage t = itemItems[_itemId];
    return t.answerCount;
  }
  function getAnswer(uint256 _itemId, uint256 _answerId) public view returns (bytes32, address, uint256) {
    ItemStruct storage t = itemItems[_itemId];
    AnswerItem memory answer = t.answers[_answerId];
    return (answer.answerHash, answer.owner, answer.questionId);
  }
  function acceptAnswer(uint256 _itemId, uint256 _answerId) public returns (bool) {
    require(_itemId <= itemCount);
    ItemStruct storage t = itemItems[_itemId];
    require(t.owner == msg.sender);
    require(t.finalized == false);
    require(t.answerCount > 0);
    require(_answerId <= t.answerCount);
    t.finalized = true;
    t.acceptedAnswer = t.answers[_answerId];
    t.acceptedAnswer.owner.transfer(t.bounty);
    //t.acceptedAnswer.owner.send(t.bounty);  // !!!!!!!!! https://ethereum.stackexchange.com/questions/19341/address-send-vs-address-transfer-best-practice-usage
    // emit event??

    return true;
  }
  function cancelItem(uint256 _itemId) public returns (bool){
    require(_itemId <= itemCount);
    ItemStruct storage t = itemItems[_itemId];
    require(t.finalized == false);
    require(t.cancelled == false);
    t.cancelled = true;
    require(t.owner == msg.sender);

    t.owner.transfer(t.bounty);
    return true;
  }

}
