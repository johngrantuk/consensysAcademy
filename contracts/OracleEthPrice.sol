pragma solidity ^0.4.17;

import { Ownable } from 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract OracleEthPrice is Ownable{
  // Contract demonstrates how an Oracle can be implemented to store external data to the blockchain.

  // EthPrice storage
  uint256 ethPrice;

  // Callback function
  event CallbackGetEthPrice();

  /** @dev Calls the callback function - This could be run on a timer or similar to consistently update price.
  */
  function updateEthPrice() public {
    emit CallbackGetEthPrice();
  }

  /** @dev Sets the price. Only accessible by a trusted owner so the price is reliable.
  * @param price uint256 Eth price in USD.
  */
  function setEthPrice(uint256 price) public
  onlyOwner()
  {
    ethPrice = price;
  } 

  /** @dev Get the Eth price.
  * @return uint256 price Eth price in USD.
  */
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
