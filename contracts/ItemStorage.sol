pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import { Ownable } from 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import { Destructible } from 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract ItemStorage is Ownable, Destructible {
  // Contract that implements permanent storage that can be used with upgradeable Item contracts.
  // Variables not made public so that only authorised contracts can access.

  // Prevents overflow issues
  using SafeMath for uint256;

  // Maps Item IDs to Items
  mapping (uint256 => Item) items;
  // No of items
  uint256 itemCount;
  // Circuit breaker
  bool stopped;

  struct Item {
    // IPFS hash containing item information
    Multihash specificationHash;
    // IPFS hash for the picture
    Multihash picHash;
    // Owner of the item
    address owner;
    // Item bounty set & paid by owner
    uint256 bounty;
    // Indicated if bounty has been isBountyCollected
    bool isBountyCollected;
    // Indicates if item has been answered
    bool isAnswered;
    // Indicates if item has been cancelled - i.e. bounty refunded to owner
    bool isCancelled;
    // Mapping all submitted answers
    mapping (uint256 => AnswerItem) answers;
    uint256 answerCount;
    // The accepted answer
    AnswerItem acceptedAnswer;
  }

  struct AnswerItem {
    // IPFS hash containing answer info
    Multihash answerHash;
    // Owner of answer
    address owner;
    // Item ID
    uint256 itemId;
  }

  // Used for storing IPFS hash in friendly way
  struct Multihash {
    bytes32 digest;
    uint8 hashFunction;
    uint8 size;
  }

  // Makes sure an Item actually exists.
  modifier itemExists(uint256 _id) {
    require(itemCount > 0);
    require(_id <= itemCount);
    _;
  }

  // Checks for Item not answered
  modifier itemNotAnswered(uint256 _id) {
    require(!items[_id].isAnswered);
    _;
  }

  // Check for Item is answered
  modifier itemAnswered(uint256 _id) {
    require(items[_id].isAnswered);
    _;
  }

  // Checks for Item not cancelled
  modifier itemNotCancelled(uint256 _id) {
    require(!items[_id].isCancelled);
    _;
  }

  // Checks for Item is cancelled
  modifier itemCancelled(uint256 _id) {
    require(items[_id].isCancelled);
    _;
  }

  // Checks that answer exists
  modifier answerExists(uint256 _itemId, uint256 _answerId) {
    require(items[_itemId].answerCount > 0);
    require(_answerId <= items[_itemId].answerCount);
    _;
  }

  // Checks address is Item owner
  modifier isItemOwner(uint256 _itemId, address _address){
    require(items[_itemId].owner == _address);
    _;
  }

  // Check Bounty not claimed
  modifier bountyNotClaimed(uint256 _itemId){
    require(items[_itemId].isBountyCollected == false);
    _;
  }

  // Checks that Bounty is payable
  modifier bountyEqualsPayable(uint256 _bountyAmount, uint256 _payableAmount){
    require(_bountyAmount == _payableAmount);
    _;
  }

  // Stops execution is stopped is true (for circuit breaker)
  modifier stop_if_emergency() {
    require(!stopped);
    _;
  }

  // Constructor sets circuit breaker to false
  function ItemStorage(){
    stopped = false;
  }

  // Toggles circuit breaker
  function toggle_active() public
  onlyOwner()
  {
    stopped = !stopped;
  }


  // Stores an item.
  // address _owner Owner of the item.
  // bytes32 _itemDigest Item IPFS digest.
  // uint8 _itemHashFunction Item IPFS hash function.
  // uint8 _itemSize Item IPFS size.
  // bytes32 _picDigest Picture IPFS digest.
  // uint8  _picHashFunction Picture IPFS hash function.
  // uint8 _picSize Picture IPFS size.
  // return uint256 The item id.
  function makeItem(address _owner, uint256 _bounty, bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable
  bountyEqualsPayable(_bounty, msg.value)
  stop_if_emergency()
  returns (uint256)
  {
    itemCount = itemCount.add(1);

    Item memory item;
    item.owner = _owner;
    item.bounty = _bounty;
    item.answerCount = 0;
    item.isAnswered = false;
    item.isCancelled = false;
    item.isBountyCollected = false;

    Multihash memory itemEntry = Multihash(_itemDigest, _itemHashFunction, _itemSize);
    item.specificationHash = itemEntry;

    Multihash memory picEntry = Multihash(_picDigest, _picHashFunction, _picSize);
    item.picHash = picEntry;

    items[itemCount] = item;

    return itemCount;
  }


  // Get item count.
  // return uint256 The number of items.
  function getItemCount() public view returns (uint256) {
    return itemCount;
  }


  // dev Get item with id.
  // uint256 _id Item ID.
  // return bytes32 Item IPFS digest.
  // return uint8 Item IPFS hash function.
  // return uint8 Item IPFS size.
  // return address Item owner address.
  // return uint256 Bounty amount.
  // return bool Is item answered.
  // return bool Is item cancelled.
  // return uint256 No of Item answers.
  // return bool Is Bounty collected.
  function getItem(uint256 _id) public view
  itemExists(_id)
  returns (bytes32, uint8, uint8, address, uint256, bool, bool, uint256, bool)
  {
    Item storage t = items[_id];
    return (t.specificationHash.digest, t.specificationHash.hashFunction, t.specificationHash.size, t.owner, t.bounty, t.isAnswered, t.isCancelled, t.answerCount, t.isBountyCollected);
  }

  // Get item picture IPFS hash info.
  // uint256 _id Item ID.
  // bytes32 Item IPFS digest.
  // uint8 Item IPFS hash function.
  // uint8 Item IPFS size.
  function getItemPicHash(uint256 _id) public view
  itemExists(_id)
  returns (bytes32, uint8, uint8)
  {
    Item storage t = items[_id];
    return (t.picHash.digest, t.picHash.hashFunction, t.picHash.size);
  }

  // Add answer to Item.
  // uint256 _itemId The item id.
  // bytes32 _answerDigest Answer IPFS digest.
  // uint8 _answerHashFunction Answer IPFS hash function.
  // uint8 _answerSize AnswerItem IPFS size.
  // address _owner Answer owner address.
  // uint256 The answer id.
  function addAnswer(uint256 _itemId, bytes32 _answerDigest, uint8 _answerHashFunction, uint8 _answerSize, address _owner) public
  itemExists(_itemId)
  stop_if_emergency()
  returns (uint256)
  {
    Item storage t = items[_itemId];

    t.answerCount = t.answerCount.add(1);

    Multihash memory answerEntry = Multihash(_answerDigest, _answerHashFunction, _answerSize);

    AnswerItem memory answer;
    answer.answerHash = answerEntry;
    answer.owner = _owner;
    answer.itemId = _itemId;

    t.answers[t.answerCount] = answer;
    return t.answerCount;
  }

  // Get no of answers for Item.
  // uint256 _itemId The item id.
  // uint256 The number answers for item with _itemId.
  function getItemAnswerCount(uint256 _itemId) public view
  itemExists(_itemId)
  returns (uint256)
  {
    Item storage t = items[_itemId];
    return t.answerCount;
  }

  // Get answer with _answerId for Item with _itemId.
  // uint256 _itemId Item ID.
  // uint256 _answerId Answer ID.
  // return bytes32 Answer IPFS digest.
  // return uint8 Answer IPFS hash function.
  // return uint8 Answer IPFS size.
  // return address Answer owner address.
  // return uint256 Answer Item ID.
  function getAnswer(uint256 _itemId, uint256 _answerId) public view
  itemExists(_itemId)
  answerExists(_itemId, _answerId)
  returns (bytes32, uint8, uint8, address, uint256)
  {
    Item storage t = items[_itemId];
    AnswerItem memory answer = t.answers[_answerId];
    return (answer.answerHash.digest, answer.answerHash.hashFunction, answer.answerHash.size, answer.owner, answer.itemId);
  }

  // Accept answer with _answerId for Item with _itemId from _senderAddr which should be owner of Item.
  // uint256 _itemId Item ID.
  // uint256 _answerId Answer ID.
  // address _senderAddr Address of Item owner.
  // return bool true
  function acceptAnswer(uint256 _itemId, uint256 _answerId, address _senderAddr) public
  itemExists(_itemId)
  itemNotAnswered(_itemId)
  answerExists(_itemId, _answerId)
  isItemOwner(_itemId, _senderAddr)
  itemNotCancelled(_itemId)
  returns (bool)
  {
    Item storage t = items[_itemId];

    t.isAnswered = true;
    t.acceptedAnswer = t.answers[_answerId];
    return true;
  }

  // Claim bounty for Item with ID.
  // uint256 _itemId Item ID.
  // address _owner Should be address of answer owner.
  // return bool true
  function claimBounty(uint256 _itemId, address _owner) public
  itemExists(_itemId)
  itemAnswered(_itemId)
  itemNotCancelled(_itemId)
  bountyNotClaimed(_itemId)
  stop_if_emergency()
  returns (bool)
  {
    Item storage t = items[_itemId];
    require(t.acceptedAnswer.owner == _owner);
    t.isBountyCollected = true;
    _owner.transfer(t.bounty);
    return true;
  }

  // Get accepted answer info for Item with ID.
  // uint256 _itemId Item ID.
  // return bytes32 Answer IPFS hash digest.
  // return uint8 Answer IPFS hash function.
  // return uint8 Answer IPFS size.
  function getAcceptedAnswer(uint256 _itemId) public view
  itemExists(_itemId)
  itemAnswered(_itemId)
  returns (bytes32, uint8, uint8)
  {
    Item storage t = items[_itemId];

    return (t.acceptedAnswer.answerHash.digest, t.acceptedAnswer.answerHash.hashFunction, t.acceptedAnswer.answerHash.size);
  }

  // Cancel Item with ID.
  // uint256 _itemId Item ID.
  // address _owner Should be address of Item owner.
  // return bool true
  function cancelItem(uint256 _itemId, address _senderAddr) public
  itemExists(_itemId)
  isItemOwner(_itemId, _senderAddr)
  itemNotCancelled(_itemId)
  itemNotAnswered(_itemId)
  returns (bool)
  {
    Item storage t = items[_itemId];
    t.isCancelled = true;

    t.owner.transfer(t.bounty);

    return true;
  }

  // Kill contract and send outstanding ether to address.
  // address transferAddress_ Address to send Ether.
  function kill(address transferAddress_) public
  {
    destroyAndSend(transferAddress_);
  }
}
