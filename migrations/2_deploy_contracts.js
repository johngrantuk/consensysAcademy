var Item = artifacts.require("./Item.sol");
var ItemStorage = artifacts.require("./ItemStorage.sol");
var ItemUpgradeable = artifacts.require("./ItemUpgradeable.sol");
var Parent = artifacts.require("./Parent.sol");

module.exports = function(deployer) {
  deployer.deploy(Item);

  //deployer.deploy(ItemStorage);
  deployer.deploy(ItemUpgradeable);
  deployer.deploy(Parent);
};

/*
var SilverCoin = artifacts.require("./SilverCoin.sol");
var Banker = artifacts.require("./Banker.sol");

module.exports = function(deployer) {
    deployer.deploy(SilverCoin).then(function() {
        return deployer.deploy(Banker, SilverCoin.address);
    }).then(function() { })
};
*/
