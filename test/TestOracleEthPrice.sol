pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/OracleEthPrice.sol";

contract TestOracleEthPrice {
  // This Oracle contract is relatively simple so limited tests i.e. < 5. See TestOracleEthPrice.js for further.
  function testSetEthPrice() public {

    OracleEthPrice oracleEth = new OracleEthPrice();

    uint256 price = 438 ether;

    oracleEth.setEthPrice(price);

    Assert.equal(price, oracleEth.getEthPrice(), "Set Eth Price Not Correct");
  }
}
