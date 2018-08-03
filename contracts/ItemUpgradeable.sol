pragma solidity ^0.4.23;

import "./ItemStorage.sol";
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import { Destructible } from 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract ItemUpgradeable is Destructible {
  // Functionality that uses separate storage.
  // Can be upgraded by Parent.

  // Prevents overflow issues
  using SafeMath for uint256;

  // Address of external storage contract.
  address public itemStorageAddr;

  // Emitted when new Item addedd.
  event ItemAdded(uint256 indexed id);
  // Emitted when new answer added.
  event AnswerAdded();
  // Emitted when an Item answer is accepted.
  event AnswerAccepted();
  // Emitted when an Item is cancelled.
  event ItemCancelled();

  /*
  Sets the address of the Storage contract.
  address _itemStorageAddr Address of storage contract.
  */
  function setDataStore(address _itemStorageAddr) public {
    itemStorageAddr = _itemStorageAddr;
  }

  // Stores an item.
  // bytes32 _itemDigest Item IPFS digest.
  // uint8 _itemHashFunction Item IPFS hash function.
  // uint8 _itemSize Item IPFS size.
  // bytes32 _picDigest Picture IPFS digest.
  // uint8  _picHashFunction Picture IPFS hash function.
  // uint8 _picSize Picture IPFS size.
  // return uint256 The item id.
  function makeItem(bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256)
  {
    uint256 itemCount;

    ItemStorage itemStore = ItemStorage(itemStorageAddr);

    itemCount = itemStore.makeItem.value(msg.value)(msg.sender, msg.value, _itemDigest, _itemHashFunction, _itemSize, _picDigest, _picHashFunction, _picSize);
    emit ItemAdded(itemCount);
    return itemCount;
  }

  // Get item count.
  // return uint256 The number of items.
  function getItemCount() public view returns (uint256) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItemCount();
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
  function getItem(uint256 _id) public view returns (bytes32, uint8, uint8, address, uint256, bool, bool, uint256, bool) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItem(_id);
  }

  // Get no of answers for Item.
  // uint256 _itemId The item id.
  // uint256 The number answers for item with _itemId.
  function getItemAnswerCount(uint256 _itemId) public view returns (uint256) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItemAnswerCount(_itemId);
  }

  // Get item picture IPFS hash info.
  // uint256 _id Item ID.
  // bytes32 Item IPFS digest.
  // uint8 Item IPFS hash function.
  // uint8 Item IPFS size.
  function getItemPicHash(uint256 _id) public view returns (bytes32, uint8, uint8) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItemPicHash(_id);
  }

  // Add answer to Item.
  // uint256 _itemId The item id.
  // bytes32 _answerDigest Answer IPFS digest.
  // uint8 _answerHashFunction Answer IPFS hash function.
  // uint8 _answerSize AnswerItem IPFS size.
  // address _owner Answer owner address.
  // uint256 The answer id.
  function addAnswer(uint256 _itemId, bytes32 _answerDigest, uint8 _answerHashFunction, uint8 _answerSize) public returns (uint256){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    uint256 answerId;
    answerId = itemStore.addAnswer(_itemId, _answerDigest, _answerHashFunction, _answerSize, msg.sender);
    emit AnswerAdded();
    return answerId;
  }

  // Get answer with _answerId for Item with _itemId.
  // uint256 _itemId Item ID.
  // uint256 _answerId Answer ID.
  // return bytes32 Answer IPFS digest.
  // return uint8 Answer IPFS hash function.
  // return uint8 Answer IPFS size.
  // return address Answer owner address.
  // return uint256 Answer Item ID.
  function getAnswer(uint256 _itemId, uint256 _answerId) public view returns (bytes32, uint8, uint8, address, uint256) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getAnswer(_itemId, _answerId);
  }

  // Accept answer with _answerId for Item with _itemId from _senderAddr which should be owner of Item.
  // uint256 _itemId Item ID.
  // uint256 _answerId Answer ID.
  // address _senderAddr Address of Item owner.
  // return bool true
  function acceptAnswer(uint256 _itemId, uint256 _answerId) public returns (bool) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    bool result;
    result = itemStore.acceptAnswer(_itemId, _answerId, msg.sender);
    emit AnswerAccepted();
    return result;
  }

  // Claim bounty for Item with ID.
  // uint256 _itemId Item ID.
  // address _owner Should be address of answer owner.
  // return bool true
  function claimBounty(uint256 _itemId) public returns (bool){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.claimBounty(_itemId, msg.sender);
  }

  // Get accepted answer info for Item with ID.
  // uint256 _itemId Item ID.
  // return bytes32 Answer IPFS hash digest.
  // return uint8 Answer IPFS hash function.
  // return uint8 Answer IPFS size.
  function getAcceptedAnswer(uint256 _itemId) public view returns (bytes32, uint8, uint8) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getAcceptedAnswer(_itemId);
  }

  // Cancel Item with ID.
  // uint256 _itemId Item ID.
  // address _owner Should be address of Item owner.
  // return bool true
  function cancelItem(uint256 _itemId) public returns (bool){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    bool result;
    result = itemStore.cancelItem(_itemId, msg.sender);
    emit ItemCancelled();

    return result;
  }

  // Kill contract and send outstanding ether to address.
  // address transferAddress_ Address to send Ether.
  function kill(address transferAddress_) public
  {
    selfdestruct(transferAddress_);
  }
}
