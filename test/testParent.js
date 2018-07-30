const ItemUpgradeable = artifacts.require("ItemUpgradeable");
const Parent = artifacts.require("Parent");

contract('Parent Tests', async (accounts) => {

    it("test Parent deploy initial Item", async () => {
      let parentInstance = await Parent.deployed();
      let ItemUpgradeableInstance = await ItemUpgradeable.deployed();

      await parentInstance.registerItem.sendTransaction(1, ItemUpgradeableInstance.address, {from: accounts[0]});

      let deployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});
      console.log(deployedAddr)

      assert.equal(ItemUpgradeableInstance.address, deployedAddr, "Parent Item deployed address doesn't match.");
    })

    it("should test new contract upgrade", async () => {
      let parentInstance = await Parent.deployed();
      let deployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});

      let newContractInstance = await ItemUpgradeable.new();

      console.log(deployedAddr)
      console.log(newContractInstance.address)

      await parentInstance.upgradeItemContract.sendTransaction(1, newContractInstance.address, {from: accounts[0]});

      let newDeployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});

      assert.equal(newDeployedAddr, newContractInstance.address, "New contract address is incorrect.");
      assert.notEqual(deployedAddr, newDeployedAddr, "New contract addr shouldn't be same as old.")
    })

    // Test for wrong owner
    // other tests
})
