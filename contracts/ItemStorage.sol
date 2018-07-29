pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import { Ownable } from 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import { Destructible } from 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';
import { PullPayment } from 'openzeppelin-solidity/contracts/payment/PullPayment.sol';

contract ItemStorage is Ownable, Destructible, PullPayment {

  using SafeMath for uint256;
  // When adding variables, do not make them public, otherwise all contracts that inherit from
  // this one will have the getters. Make custom getters in the contract that seems most appropriate,

  mapping (uint256 => Item) items;
  uint256 itemCount;

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

  modifier itemExists(uint256 _id) {
    require(itemCount > 0);
    require(_id <= itemCount);
    _;
  }

  modifier itemNotAnswered(uint256 _id) {
    require(!items[_id].isAnswered);
    _;
  }

  modifier itemAnswered(uint256 _id) {
    require(items[_id].isAnswered);
    _;
  }

  modifier itemNotCancelled(uint256 _id) {
    require(!items[_id].isCancelled);
    _;
  }

  modifier itemCancelled(uint256 _id) {
    require(items[_id].isCancelled);
    _;
  }

  modifier answerExists(uint256 _itemId, uint256 _answerId) {
    require(items[_itemId].answerCount > 0);
    require(_answerId <= items[_itemId].answerCount);
    _;
  }

  modifier isItemOwner(uint256 _itemId, address _address){
    require(items[_itemId].owner == _address);
    _;
  }

  modifier bountyNotClaimed(uint256 _itemId){
    require(items[_itemId].isBountyCollected == false);
    _;
  }

  function makeItem(address _owner, uint256 _bounty, bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256)
  {
    // ADD A CHECK THAT BOUNTY AND PAYABLE IS CORRECT
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

  function getItemCount() public view returns (uint256) {
    return itemCount;
  }

  function getItem(uint256 _id) public view
  itemExists(_id)
  returns (bytes32, uint8, uint8, address, uint256, bool, bool, uint256, bool)
  {
    Item storage t = items[_id];
    return (t.specificationHash.digest, t.specificationHash.hashFunction, t.specificationHash.size, t.owner, t.bounty, t.isAnswered, t.isCancelled, t.answerCount, t.isBountyCollected);
  }

  function getItemPicHash(uint256 _id) public view
  itemExists(_id)
  returns (bytes32, uint8, uint8)
  {
    Item storage t = items[_id];
    return (t.picHash.digest, t.picHash.hashFunction, t.picHash.size);
  }

  function addAnswer(uint256 _itemId, bytes32 _answerDigest, uint8 _answerHashFunction, uint8 _answerSize, address _owner) public
  itemExists(_itemId)
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

  function getItemAnswerCount(uint256 _itemId) public view
  itemExists(_itemId)
  returns (uint256)
  {
    Item storage t = items[_itemId];
    return t.answerCount;
  }

  function getAnswer(uint256 _itemId, uint256 _answerId) public view
  itemExists(_itemId)
  answerExists(_itemId, _answerId)
  returns (bytes32, uint8, uint8, address, uint256)
  {
    Item storage t = items[_itemId];
    AnswerItem memory answer = t.answers[_answerId];
    return (answer.answerHash.digest, answer.answerHash.hashFunction, answer.answerHash.size, answer.owner, answer.itemId);
  }

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

  function claimBounty(uint256 _itemId, address _owner) public
  itemExists(_itemId)
  itemAnswered(_itemId)
  itemNotCancelled(_itemId)
  bountyNotClaimed(_itemId)
  returns (bool)
  {
    Item storage t = items[_itemId];
    require(t.acceptedAnswer.owner == _owner);
    t.isBountyCollected = true;
    _owner.transfer(t.bounty);
    return true;
  }


  function acceptAnswerOld(uint256 _itemId, uint256 _answerId, address _senderAddr) public
  itemExists(_itemId)
  itemNotAnswered(_itemId)
  answerExists(_itemId, _answerId)
  isItemOwner(_itemId, _senderAddr)
  returns (bool)
  {
    Item storage t = items[_itemId];

    t.isAnswered = true;
    t.acceptedAnswer = t.answers[_answerId];
    t.acceptedAnswer.owner.transfer(t.bounty);  // CHANGE TO WITHDRAWAL
    //t.acceptedAnswer.owner.send(t.bounty);  // !!!!!!!!! https://ethereum.stackexchange.com/questions/19341/address-send-vs-address-transfer-best-practice-usage
    return true;
  }

  function getAcceptedAnswer(uint256 _itemId) public view
  itemExists(_itemId)
  itemAnswered(_itemId)
  returns (bytes32, uint8, uint8)
  {
    Item storage t = items[_itemId];

    return (t.acceptedAnswer.answerHash.digest, t.acceptedAnswer.answerHash.hashFunction, t.acceptedAnswer.answerHash.size);
  }

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

  function kill(address transferAddress_) public
  {
    destroyAndSend(transferAddress_);
  }
}
