var Item = artifacts.require("./Item.sol");
var ItemStorage = artifacts.require("./ItemStorage.sol");
var ItemUpgradeable = artifacts.require("./ItemUpgradeable.sol");
var Parent = artifacts.require("./Parent.sol");

module.exports = function(deployer) {
  /*
  deployer.deploy(Item);
  deployer.deploy(ItemUpgradeable);
  deployer.deploy(Parent);

  */

  var itemUpgradeableInstance;
  var parentInstance;
  /*
  deployer.deploy(ItemUpgradeable).then(function () {
    itemUpgradeableInstance = ItemUpgradeable;
    console.log('ItemUpgradeable deployed.')
    deployer.deploy(Parent).then(function (){
      console.log('Parent deployed.');
      parentInstance = Parent;
      parentInstance.registerItem.sendTransaction(1, itemUpgradeableInstance.address, {from: accounts[0]}).then(function(){
        console.log('Item contract registered.')
      })
    })
  })
  */
  /*
  var a, b;
  deployer.then(function() {
    // Create a new version of A
    return ItemUpgradeable.new();
  }).then(function(instance) {
    a = instance;
    // Get the deployed instance of B
    return Parent.deployed();
  }).then(function(instance) {
    b = instance;
    // Set the new instance of A's address on B via B's setA() function.
    return b.registerItem(a.address);
  });
  */
  deployer.deploy(ItemUpgradeable).then(function (instance) {
    itemUpgradeableInstance = instance;
    return deployer.deploy(Parent);
  }).then(function(instance){
    return instance.registerItem.sendTransaction(1, itemUpgradeableInstance.address);
  }).then(function (){
    console.log('The end?')
    return
  })

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
