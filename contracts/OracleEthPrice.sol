pragma solidity ^0.4.17;

import { Ownable } from 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract OracleEthPrice is Ownable{

  // EthPrice storage
  uint256 ethPrice;

  // Callback function
  event CallbackGetEthPrice();

  function updateEthPrice() public {
    // Calls the callback function
    emit CallbackGetEthPrice();
  }

  function setEthPrice(uint256 price) public
  onlyOwner()
  {
    // If it isn't sent by a trusted oracle
    // a.k.a ourselves, ignore it
    ethPrice = price;
  }

  function getEthPrice() constant public returns (uint256) {
    return ethPrice;
  }
}

/*
This would be better acheived using something like Oraclize but because this is likely to be tested/evaluated on a local test network I implemented my own Oracle functionality to demonstrate.
The code below demonstrates how the Eth/USD price could be retreived using Oraclize.

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleOraclizeContract is usingOraclize {

    string public ETHUSD;
    event LogConstructorInitiated(string nextStep);
    event LogPriceUpdated(string price);
    event LogNewOraclizeQuery(string description);

    function ExampleOraclizeContract() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) revert();
        ETHUSD = result;
        LogPriceUpdated(result);
    }

    function updatePrice() payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.coinmarketcap.com/v1/ticker/ethereum/).price_usd");
        }
    }
}
*/
