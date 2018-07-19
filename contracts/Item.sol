pragma solidity ^0.4.23;

contract Item {

  event ItemAdded(uint256 indexed id);
  event AnswerAdded();
  event AnswerAccepted();
  event ItemCancelled();

  mapping (uint256 => ItemStruct) itemItems;
  uint256 itemCount;

  struct AnswerItem {
    Multihash answerHash;
    address owner;
    uint256 questionId;
  }

  struct ItemStruct {
    Multihash specificationHash;
    Multihash picHash;
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

  struct Multihash {
    bytes32 digest;
    uint8 hashFunction;
    uint8 size;
  }

  function makeItem(bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256)
  {
    itemCount += 1;

    ItemStruct memory item;
    item.owner = msg.sender;
    item.bounty = msg.value;
    item.answerCount = 0;
    item.finalized = false;
    item.cancelled = false;

    Multihash memory itemEntry = Multihash(_itemDigest, _itemHashFunction, _itemSize);
    item.specificationHash = itemEntry;

    Multihash memory picEntry = Multihash(_picDigest, _picHashFunction, _picSize);
    item.picHash = picEntry;

    itemItems[itemCount] = item;

    emit ItemAdded(itemCount);
    return itemCount;
  }

  function getItemCount() public view returns (uint256) {
    return itemCount;
  }

  // Submit info to Item

  // Close Item/Payout Bounty

  //Get Item
  function getItem(uint256 _id) public view returns (bytes32, uint8, uint8, address, uint256, bool, bool, uint256) {
    require(itemCount > 0);
    require(_id <= itemCount);
    ItemStruct storage t = itemItems[_id];

    return (t.specificationHash.digest, t.specificationHash.hashFunction, t.specificationHash.size, t.owner, t.bounty, t.finalized, t.cancelled, t.answerCount);
  }
  function getItemPicHash(uint256 _id) public view returns (bytes32, uint8, uint8) {
    require(itemCount > 0);
    require(_id <= itemCount);
    ItemStruct storage t = itemItems[_id];

    return (t.picHash.digest, t.picHash.hashFunction, t.picHash.size);
  }
  function addAnswer(uint256 _itemId, bytes32 _answerDigest, uint8 _answerHashFunction, uint8 _answerSize) public returns (uint256){
    ItemStruct storage t = itemItems[_itemId];

    t.answerCount += 1;

    Multihash memory answerEntry = Multihash(_answerDigest, _answerHashFunction, _answerSize);

    AnswerItem memory answer;
    answer.answerHash = answerEntry;
    answer.owner = msg.sender;
    answer.questionId = t.answerCount;

    t.answers[t.answerCount] = answer;
    emit AnswerAdded();

    return t.answerCount;
  }
  function getItemAnswerCount(uint256 _itemId) public view returns (uint256) {
    ItemStruct storage t = itemItems[_itemId];
    return t.answerCount;
  }
  function getAnswer(uint256 _itemId, uint256 _answerId) public view returns (bytes32, uint8, uint8, address, uint256) {
    ItemStruct storage t = itemItems[_itemId];
    AnswerItem memory answer = t.answers[_answerId];
    return (answer.answerHash.digest, answer.answerHash.hashFunction, answer.answerHash.size, answer.owner, answer.questionId);
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
    emit AnswerAccepted();

    return true;
  }
  function getAcceptedAnswer(uint256 _itemId) public view returns (bytes32, uint8, uint8) {
    require(_itemId <= itemCount);
    ItemStruct storage t = itemItems[_itemId];
    require(t.answerCount > 0);
    require(t.finalized == true);

    return (t.acceptedAnswer.answerHash.digest, t.acceptedAnswer.answerHash.hashFunction, t.acceptedAnswer.answerHash.size);
  }
  function cancelItem(uint256 _itemId) public returns (bool){
    require(_itemId <= itemCount);
    ItemStruct storage t = itemItems[_itemId];
    require(t.finalized == false);
    require(t.cancelled == false);
    t.cancelled = true;
    require(t.owner == msg.sender);

    t.owner.transfer(t.bounty);

    emit ItemCancelled();

    return true;
  }

}
