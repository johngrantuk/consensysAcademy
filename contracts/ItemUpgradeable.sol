pragma solidity ^0.4.23;

import "./ItemStorage.sol";
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import { Destructible } from 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract ItemUpgradeable is Destructible {

  using SafeMath for uint256;

  address public itemStorageAddr;

  event ItemAdded(uint256 indexed id);
  event AnswerAdded();
  event AnswerAccepted();
  event ItemCancelled();

  function setDataStore(address _itemStorageAddr) public {
    itemStorageAddr = _itemStorageAddr;
  }

  function makeItem(bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256)
  {
    // Check bounth and value are same
    uint256 itemCount;

    ItemStorage itemStore = ItemStorage(itemStorageAddr);

    itemCount = itemStore.makeItem.value(msg.value)(msg.sender, msg.value, _itemDigest, _itemHashFunction, _itemSize, _picDigest, _picHashFunction, _picSize);
    emit ItemAdded(itemCount);
    return itemCount;
  }

  function getItemCount() public view returns (uint256) {

    ItemStorage itemStore = ItemStorage(itemStorageAddr);

    return itemStore.getItemCount();
  }

  function getItem(uint256 _id) public view returns (bytes32, uint8, uint8, address, uint256, bool, bool, uint256, bool) {

    ItemStorage itemStore = ItemStorage(itemStorageAddr);

    return itemStore.getItem(_id);
  }

  function getItemAnswerCount(uint256 _itemId) public view returns (uint256) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItemAnswerCount(_itemId);
  }

  function getItemPicHash(uint256 _id) public view returns (bytes32, uint8, uint8) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItemPicHash(_id);
  }

  function addAnswer(uint256 _itemId, bytes32 _answerDigest, uint8 _answerHashFunction, uint8 _answerSize) public returns (uint256){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    uint256 answerId;
    answerId = itemStore.addAnswer(_itemId, _answerDigest, _answerHashFunction, _answerSize, msg.sender);
    emit AnswerAdded();
    return answerId;
  }

  function getAnswer(uint256 _itemId, uint256 _answerId) public view returns (bytes32, uint8, uint8, address, uint256) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getAnswer(_itemId, _answerId);
  }

  function acceptAnswer(uint256 _itemId, uint256 _answerId) public returns (bool) {

    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    bool result;
    result = itemStore.acceptAnswer(_itemId, _answerId, msg.sender);
    emit AnswerAccepted();

    return result;
  }

  function claimBounty(uint256 _itemId) public returns (bool){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.claimBounty(_itemId, msg.sender);
  }

  function getAcceptedAnswer(uint256 _itemId) public view returns (bytes32, uint8, uint8) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getAcceptedAnswer(_itemId);
  }

  function cancelItem(uint256 _itemId) public returns (bool){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    bool result;
    result = itemStore.cancelItem(_itemId, msg.sender);
    emit ItemCancelled();

    return result;
  }

  function kill(address upgradedOrganisation_)
  {
    selfdestruct(upgradedOrganisation_);
  }
  /*
  function kill(address upgradedContract_) public
  {
    destroyAndSend(upgradedContract_);
  }
  */

}
