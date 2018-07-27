pragma solidity ^0.4.23;

contract ItemInterface
{
  address public itemStorage;
  function setDataStore(address _itemStorage);
  function makeItem(bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256);
  function getItemCount() public view returns (uint256);
  function getItem(uint256 _id) public view returns (bytes32, uint8, uint8, address, uint256, bool, bool, uint256);
  function getItemAnswerCount(uint256 _itemId) public view returns (uint256);
  function kill(address upgradedContract_);
  function getItemPicHash(uint256 _id) public view returns (bytes32, uint8, uint8);
  function addAnswer(uint256 _itemId, bytes32 _answerDigest, uint8 _answerHashFunction, uint8 _answerSize) public returns (uint256);
  function getAnswer(uint256 _itemId, uint256 _answerId) public view returns (bytes32, uint8, uint8, address, uint256);
  function acceptAnswer(uint256 _itemId, uint256 _answerId) public returns (bool);
  function getAcceptedAnswer(uint256 _itemId) public view returns (bytes32, uint8, uint8);
  function cancelItem(uint256 _itemId) public returns (bool);
}
