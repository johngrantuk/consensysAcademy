var ItemStorage = artifacts.require("./ItemStorage.sol");
var ItemUpgradeable = artifacts.require("./ItemUpgradeable.sol");
var Parent = artifacts.require("./Parent.sol");
var OracleEthPrice = artifacts.require("./OracleEthPrice.sol");

module.exports = function(deployer) {
  /*
  deployer.deploy(Item);
  deployer.deploy(ItemUpgradeable);
  deployer.deploy(Parent);

  */

  var itemUpgradeableInstance;
  /*
  Deploys Parent and ItemUpgradeable contracts. Then call registerItem on Parent so that the first upgradeable Item contract is set-up with storage contract.
  */
  deployer.deploy(OracleEthPrice);

  deployer.deploy(ItemUpgradeable).then(function (instance) {
    itemUpgradeableInstance = instance;
    return deployer.deploy(Parent);
  }).then(function(instance){
    return instance.registerItem.sendTransaction(1, itemUpgradeableInstance.address);
  }).then(function (){
    console.log('ItemUpgradeable set-up as first version with storage.')
    return
  })

};
