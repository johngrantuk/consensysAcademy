pragma solidity ^0.4.23;

contract ItemInterface
{
  address public itemStorage;
  function setDataStore(address _itemStorage);
  function makeItem(bytes32 _itemDigest, uint8 _itemHashFunction, uint8 _itemSize, bytes32 _picDigest, uint8 _picHashFunction, uint8 _picSize) public payable returns (uint256);
  function kill(address upgradedOrganisation_);
}
