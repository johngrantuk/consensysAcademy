pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract ItemStorage {

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
    require(_answerId <= items[_itemId].answerCount);
    _;
  }

  function makeItem(address _owner, uint256 _bounty, bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256)
  {
    itemCount = itemCount.add(1);

    Item memory item;
    item.owner = _owner;
    item.bounty = _bounty;
    item.answerCount = 0;
    item.isAnswered = false;
    item.isCancelled = false;

    Multihash memory itemEntry = Multihash(_itemDigest, _itemHashFunction, _itemSize);
    item.specificationHash = itemEntry;

    Multihash memory picEntry = Multihash(_picDigest, _picHashFunction, _picSize);
    item.picHash = picEntry;

    items[itemCount] = item;

    // emit ItemAdded(itemCount);
    return itemCount;
  }
}
