pragma solidity ^0.4.23;

import "./ItemStorage.sol";
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import { Destructible } from 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract ItemUpgradeable is Destructible {

  using SafeMath for uint256;

  address public itemStorage;

  event ItemAdded(uint256 indexed id);
  event AnswerAdded();
  event AnswerAccepted();
  event ItemCancelled();

  function setDataStore(address _itemStorage) public {
    itemStorage = _itemStorage;
  }

  function makeItem(bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256)
  {
    uint256 itemCount;

    ItemStorage itemStore = ItemStorage(itemStorage);

    itemCount = itemStore.makeItem(msg.sender, msg.value, _itemDigest, _itemHashFunction, _itemSize, _picDigest, _picHashFunction, _picSize);
    emit ItemAdded(itemCount);
    return itemCount;
  }

  function kill(address upgradedOrganisation_) public
  {
    destroyAndSend(upgradedOrganisation_);
  }

}
