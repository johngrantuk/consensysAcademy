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

  /** @dev Sets the address of the Storage contract.
  * @param _itemStorageAddr address Address of storage contract.
  */
  function setDataStore(address _itemStorageAddr) public {
    itemStorageAddr = _itemStorageAddr;
  }

  /** @dev Stores an item.
  * @param _itemDigest bytes32 Item IPFS digest.
  * @param _itemHashFunction uint8 Item IPFS hash function.
  * @param _itemSize uint8 Item IPFS size.
  * @param _picDigest bytes32 Picture IPFS digest.
  * @param _picHashFunction uint8 Picture IPFS hash function.
  * @param _picSize uint8 Picture IPFS size.
  * @return uint256 The Item id.
  */
  function makeItem(bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256)
  {
    uint256 itemCount;

    ItemStorage itemStore = ItemStorage(itemStorageAddr);

    itemCount = itemStore.makeItem.value(msg.value)(msg.sender, msg.value, _itemDigest, _itemHashFunction, _itemSize, _picDigest, _picHashFunction, _picSize);
    emit ItemAdded(itemCount);
    return itemCount;
  }

  /** @dev Get item count.
  * @return uint256 The number of items.
  */
  function getItemCount() public view returns (uint256) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItemCount();
  }

  /** @dev Get item with id.
  * @param _id uint256 Item ID.
  * @return bytes32 Item IPFS digest.
  * @return uint8 Item IPFS hash function.
  * @return uint8 Item IPFS size.
  * @return address Item owner address.
  * @return uint256 Bounty amount.
  * @return bool Is item answered.
  * @return bool Is item cancelled.
  * @return uint256 No of Item answers.
  * @return bool Is Bounty collected.
  */
  function getItem(uint256 _id) public view returns (bytes32, uint8, uint8, address, uint256, bool, bool, uint256, bool) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItem(_id);
  }

  /** @dev Get no of answers for Item.
  * @param _itemId uint256 The item id.
  * @return uint256 The number answers for item with _itemId.
  */
  function getItemAnswerCount(uint256 _itemId) public view returns (uint256) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItemAnswerCount(_itemId);
  }

  /** @dev Get item picture IPFS hash info.
  * @param _id uint256 Item ID.
  * @return bytes32 Item IPFS digest.
  * @return uint8 Item IPFS hash function.
  * @return uint8 Item IPFS size.
  */
  function getItemPicHash(uint256 _id) public view returns (bytes32, uint8, uint8) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getItemPicHash(_id);
  }

  /** @dev Add answer to Item.
  * @param _itemId uint256 The item id.
  * @param _answerDigest bytes32 Answer IPFS digest.
  * @param _answerHashFunction uint8 Answer IPFS hash function.
  * @param _answerSize uint8 AnswerItem IPFS size.
  * @return uint256 The answer id.
  */
  function addAnswer(uint256 _itemId, bytes32 _answerDigest, uint8 _answerHashFunction, uint8 _answerSize) public returns (uint256){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    uint256 answerId;
    answerId = itemStore.addAnswer(_itemId, _answerDigest, _answerHashFunction, _answerSize, msg.sender);
    emit AnswerAdded();
    return answerId;
  }

  /** @dev Get answer with _answerId for Item with _itemId.
  * @param _itemId uint256 Item ID.
  * @param _answerId uint256 Answer ID.
  * @return bytes32 Answer IPFS digest.
  * @return uint8 Answer IPFS hash function.
  * @return uint8 Answer IPFS size.
  * @return address Answer owner address.
  * @return uint256 Answer Item ID.
  */
  function getAnswer(uint256 _itemId, uint256 _answerId) public view returns (bytes32, uint8, uint8, address, uint256) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getAnswer(_itemId, _answerId);
  }

  /** @dev Accept answer with _answerId for Item with _itemId.
  * @param _itemId uint256 Item ID.
  * @param _answerId uint256 Answer ID.
  * @return bool true
  */
  function acceptAnswer(uint256 _itemId, uint256 _answerId) public returns (bool) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    bool result;
    result = itemStore.acceptAnswer(_itemId, _answerId, msg.sender);
    emit AnswerAccepted();
    return result;
  }

  /** @dev Claim bounty for Item with ID.
  * @param _itemId uint256 Item ID.
  * @return bool true
  */
  function claimBounty(uint256 _itemId) public returns (bool){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.claimBounty(_itemId, msg.sender);
  }

  /** @dev Get accepted answer info for Item with ID.
  * @param _itemId uint256 Item ID.
  * @return bytes32 Answer IPFS hash digest.
  * @return uint8 Answer IPFS hash function.
  * @return uint8 Answer IPFS size.
  */
  function getAcceptedAnswer(uint256 _itemId) public view returns (bytes32, uint8, uint8) {
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    return itemStore.getAcceptedAnswer(_itemId);
  }

  /** @dev Cancel Item with ID.
  * @param _itemId uint256 Item ID.
  * @return bool true
  */
  function cancelItem(uint256 _itemId) public returns (bool){
    ItemStorage itemStore = ItemStorage(itemStorageAddr);
    bool result;
    result = itemStore.cancelItem(_itemId, msg.sender);
    emit ItemCancelled();

    return result;
  }

  /** @dev Kill contract and send outstanding ether to address.
  * @param transferAddress_ address Address to send Ether.
  */
  function kill(address transferAddress_) public
  {
    selfdestruct(transferAddress_);
  }
}
