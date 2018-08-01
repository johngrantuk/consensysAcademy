const ItemUpgradeable = artifacts.require("ItemUpgradeable");
const Parent = artifacts.require("Parent");
import { getBytes32FromMultiash, getMultihashFromBytes32 } from '../src/libs/multihash';

// This is a helper function to test for throws.
const expectThrow = async (promise) => {
      try {
        await promise;
      } catch (error) {
        const invalidJump = error.message.search('invalid JUMP') >= 0;
        const outOfGas = error.message.search('out of gas') >= 0;
        const revert = error.message.search('revert') >= 0;
        assert(
          invalidJump || outOfGas || revert,
          "Expected throw, got '" + error + "' instead",
        );
        return;
      }
      assert.fail(0, 1, 'Expected throw not received');
}

contract('Parent Tests', async (accounts) => {

    it("test Parent deploy initial Item", async () => {
      // Parent contract is responsible for managing Item contracts which are upgradeable and use permanent storage from ItemStorage contract.
      // Registers the ItemUpgradeable contract and sets the Storage contract as its data store
      let parentInstance = await Parent.deployed();
      let ItemUpgradeableInstance = await ItemUpgradeable.deployed();

      await parentInstance.registerItem.sendTransaction(1, ItemUpgradeableInstance.address, {from: accounts[0]});

      let deployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});

      assert.equal(ItemUpgradeableInstance.address, deployedAddr, "Parent Item deployed address doesn't match.");
    })

    it("should make item using deployed version of contract", async () => {
      // This creates an item using the registered contract. Tests the makeItem function but also sets the Item in the Storage contracts storage for future tests.
      let parentInstance = await Parent.deployed();

      let itemHash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8';
      let pictureHash = 'Qmb4atcgbbN5v4CDJ8nz5QG5L2pgwSTLd3raDrnyhLjnUH';
      let bounty_amount = web3.toWei(1, 'ether');

      let itemMultiHash = getBytes32FromMultiash(itemHash);
      let picMultiHash = getBytes32FromMultiash(pictureHash);

      let deployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});

      let instance = await ItemUpgradeable.at(deployedAddr);

      let hash = await instance.makeItem.sendTransaction(itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: bounty_amount, from: accounts[0]});            // Creates Item

      hash = await instance.getItem.call(1, {from: accounts[0]});
      let specificationHashDigest = hash[0];
      let specificationHashfunction = hash[1].toNumber();
      let specificationHashSize = hash[2].toNumber();

      let output = getMultihashFromBytes32(specificationHashDigest, specificationHashfunction, specificationHashSize);

      assert.equal(itemHash, output, "create item info should be correct");
    });

    it("new contract should be deployed and registered address changed", async () => {
      // The Parent upgrades the old ItemUpgradeable contract to the address of a new contract.
      let parentInstance = await Parent.deployed();
      let deployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});

      let newContractInstance = await ItemUpgradeable.new();

      await parentInstance.upgradeItemContract.sendTransaction(1, newContractInstance.address, {from: accounts[0]});

      let newDeployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});

      assert.equal(newDeployedAddr, newContractInstance.address, "New contract address is incorrect.");
      assert.notEqual(deployedAddr, newDeployedAddr, "New contract addr shouldn't be same as old.")
    })

    it("new contract should still be using same storage", async () => {
      // The new registered ItemUpgradeable contract should still be using the same data store from the Storage contract.
      let parentInstance = await Parent.deployed();

      let itemHash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8';
      let pictureHash = 'Qmb4atcgbbN5v4CDJ8nz5QG5L2pgwSTLd3raDrnyhLjnUH';
      let bounty_amount = web3.toWei(1, 'ether');

      let deployedAddr = await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});

      let instance = await ItemUpgradeable.at(deployedAddr);

      let hash = await instance.getItem.call(1, {from: accounts[0]});
      let specificationHashDigest = hash[0];
      let specificationHashfunction = hash[1].toNumber();
      let specificationHashSize = hash[2].toNumber();

      let output = getMultihashFromBytes32(specificationHashDigest, specificationHashfunction, specificationHashSize);

      assert.equal(itemHash, output, "the new contract isn't accessing data correctly.");
    })

    it("should throw when non-owner tries to register contract", async () => {
      // Only the owner of Parent can register, upgrade, etc
      let parentInstance = await Parent.deployed();
      let ItemUpgradeableInstance = await ItemUpgradeable.deployed();
      expectThrow(parentInstance.registerItem.sendTransaction(1, ItemUpgradeableInstance.address, {from: accounts[1]}));
    })

    it("should throw when non-owner tries to kill contract", async () => {
      // Only the owner of Parent can kill it etc
      let parentInstance = await Parent.deployed();
      expectThrow(parentInstance.kill.sendTransaction(accounts[1], {from: accounts[1]}));
    })

    it("should kill contract", async () => {
      // Once contract is killed it no longer exists so a function call should fail.
      let parentInstance = await Parent.deployed();
      let hash = await parentInstance.kill.sendTransaction(accounts[0], {from: accounts[0]});

      try {
        await parentInstance.getItemContractAddress.call(1, {from: accounts[0]});
      } catch (error) {
        const notContract = error.message.search('is not a contract address') >= 0;

        assert(notContract, "Expected Not A Contract, got '" + error + "' instead",);
        return;
      }
      assert.fail(0, 1, 'Expected contract kill');
    })
})
