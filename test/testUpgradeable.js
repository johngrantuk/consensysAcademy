//import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';
const Item = artifacts.require("Item");
// const ItemStorage = artificat.require("ItemStorage")
const ItemUpgradeable = artifacts.require("ItemUpgradeable")
const Parent = artifacts.require("Parent")

contract('Upgradeable Tests', async (accounts) => {

    it("should match addr.", async () => {
      let parentInstance = await Parent.deployed();
      let ItemUpgradeableInstance = await ItemUpgradeable.deployed();
      console.log(ItemUpgradeableInstance.address)

      await parentInstance.registerItem.sendTransaction(1, ItemUpgradeableInstance.address, {from: accounts[1]});
      let deployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[1]});
      console.log(deployedAddr)

      assert.equal(ItemUpgradeableInstance.address, deployedAddr, "Address not match.");
    })

    // ADD AN ACTUAL TEST HERE FOR UPGRADE

})
