//import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';
const Item = artifacts.require("Item");
import { getBytes32FromMultiash, getMultihashFromBytes32 } from '../src/libs/multihash';

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

contract('Item Tests', async (accounts) => {

    let itemHash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8';
    let pictureHash = 'Qmb4atcgbbN5v4CDJ8nz5QG5L2pgwSTLd3raDrnyhLjnUH';
    let answer1Hash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLn1z9djWo';
    let answer2Hash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLn9UWrx6Y';

    let bounty_amount = web3.toWei(1, 'ether');

    it("should have 0 item count on deploy.", async () => {
       let instance = await Item.deployed();
       let itemCount = await instance.getItemCount();
       assert.equal(itemCount.valueOf(), 0, "Initial item count incorrect.");
    })

    it("get non-existing item should throw.", async () => {
      let instance = await Item.deployed();
      expectThrow(instance.getItem(99));
    })

    it("should make item with correct bounty", async () => {
      //const { itemDigest, itemHashFunction, itemSize } = getBytes32FromMultiash(itemHash);
      let itemMultiHash = getBytes32FromMultiash(itemHash);
      let picMultiHash = getBytes32FromMultiash(pictureHash);

      let instance = await Item.deployed();

      let account_one_starting_balance = await web3.eth.getBalance(accounts[0]);

      let hash = await instance.makeItem.sendTransaction(itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: bounty_amount, from: accounts[0]});            // Creates Item

      const tx = await web3.eth.getTransaction(hash);
      const receipt = await web3.eth.getTransactionReceipt(hash);                                                           // Calculates used Gas for Create Item
      const gasCost = tx.gasPrice.mul(receipt.gasUsed);

      let account_one_ending_balance = await web3.eth.getBalance(accounts[0]);
      let account_one_ending_balance_check = account_one_starting_balance.minus(gasCost);
      account_one_ending_balance_check = account_one_ending_balance_check.minus(bounty_amount);                           // This is all deductions

      assert.equal(account_one_ending_balance.toNumber(), account_one_ending_balance_check.toNumber(), "Bounty amount for make item wasn't correctly taken from the creator");
    });

    it("should be one item created", async () => {
      let instance = await Item.deployed();
      let hash = await instance.getItemCount.call();
      assert.equal(1, hash.toNumber(), "Should be 1 item created.");
    });

    it("should be 0 answer for item", async () => {
      let instance = await Item.deployed();
      let hash = await instance.getItemAnswerCount.call(1);
      assert.equal(0, hash.toNumber(), "Should be 0 answers created for item.");
    });

    it("should match spec hashes", async () => {
      let instance = await Item.deployed();
      let hash = await instance.getItem.call(1, {from: accounts[0]});
      let specificationHashDigest = hash[0];
      let specificationHashfunction = hash[1].toNumber();
      let specificationHashSize = hash[2].toNumber();

      let output = getMultihashFromBytes32(specificationHashDigest, specificationHashfunction, specificationHashSize);

      assert.equal(itemHash, output, "spec hash should be same");

    });

    it("should match pic hashes", async () => {
      let instance = await Item.deployed();
      let hash = await instance.getItemPicHash.call(1, {from: accounts[0]});
      let picHashDigest = hash[0];
      let picHashfunction = hash[1].toNumber();
      let picHashSize = hash[2].toNumber();

      let output = getMultihashFromBytes32(picHashDigest, picHashfunction, picHashSize);

      assert.equal(pictureHash, output, "pic hash should be same");

    });

    it("should throw when no answers and accepted", async () => {
      let instance = await Item.deployed();
      expectThrow(instance.acceptAnswer.sendTransaction(1, 0, {from: accounts[0]}));
    });

    it("should create 1 answer", async () => {
      let answerMultiHash = getBytes32FromMultiash(answer1Hash);

      let instance = await Item.deployed();

      let hash = await instance.addAnswer.sendTransaction(1, answerMultiHash.digest, answerMultiHash.hashFunction, answerMultiHash.size, {from: accounts[1]});

      hash = await instance.getItemAnswerCount.call(1);
      assert.equal(1, hash.toNumber(), "Should be 1 answer created for item.");
    });
    it("get answer should have correct information", async () => {

      let instance = await Item.deployed();

      let hash = await instance.getAnswer.call(1, 1, {from: accounts[0]});
      let answerHashDigest = hash[0];
      let answerHashfunction = hash[1].toNumber();
      let answerHashSize = hash[2].toNumber();
      let answerOwner = hash[3];
      let itemId = hash[4].toNumber();

      let output = getMultihashFromBytes32(answerHashDigest, answerHashfunction, answerHashSize);

      assert.equal(answer1Hash, output, "answer hash should be same");
      assert.equal(answerOwner, accounts[1], "Answer owner should be accounts[1]");
      assert.equal(1, itemId, "ItemId should be 1.")
    });

    it("should have 2 answers", async () => {
      let answerMultiHash = getBytes32FromMultiash(answer2Hash);
      let instance = await Item.deployed();

      let hash = await instance.addAnswer.sendTransaction(1, answerMultiHash.digest, answerMultiHash.hashFunction, answerMultiHash.size, {from: accounts[2]});

      hash = await instance.getItemAnswerCount.call(1);
      assert.equal(2, hash.toNumber(), "Should be 2 answers created for item.");
    });

    it("should throw when incorrect owner accepts answer", async () => {
      let instance = await Item.deployed();
      expectThrow(instance.acceptAnswer.sendTransaction(1, 2, {from: accounts[1]}));
    });

    it("should transfer bounty to account 2 after answer accepted", async () => {
      let instance = await Item.deployed();

      let account_two_starting_balance = await web3.eth.getBalance(accounts[2]);

      let hash = await instance.acceptAnswer.sendTransaction(1, 2, {from: accounts[0]});

      let account_two_ending_balance = await web3.eth.getBalance(accounts[2]);

      assert.equal(account_two_ending_balance.toNumber(), account_two_starting_balance.plus(bounty_amount).toNumber(), "Amount wasn't correctly sent to correct answer owner.");
    });

    it("finalised item should all be correct", async () => {
      let instance = await Item.deployed();
      let hash = await instance.getItem.call(1, {from: accounts[0]});
      let specHashDigest = hash[0];
      let specHashfunction = hash[1].toNumber();
      let specHashSize = hash[2].toNumber();
      let owner = hash[3];
      let bounty = hash[4].toNumber();
      let finalised = hash[5];
      let cancelled = hash[6];

      let specHash = getMultihashFromBytes32(specHashDigest, specHashfunction, specHashSize);

      assert.equal(specHash, itemHash, "Item hash wasn't same.");
      assert.equal(owner, accounts[0], "Item owner not correct.");
      assert.equal(bounty, bounty_amount, "Item Bounty not correct.");
      assert.equal(finalised, true, "Item should be finalised.");
      assert.equal(cancelled, false, "Item should not be cancelled.");
    });

    it("should throw when accept called on answer already accepted", async () => {
      let instance = await Item.deployed();
      expectThrow(instance.acceptAnswer.sendTransaction(1, 2, {from: accounts[0]}));
    });

    it("show throw when cancel called on non-item", async () => {
      let instance = await Item.deployed();
      expectThrow(instance.cancelItem.sendTransaction(99, {from: accounts[0]}));
    })

    it("should throw when cancel on finalised item", async () => {
      let instance = await Item.deployed();
      expectThrow(instance.cancelItem.sendTransaction(1, {from: accounts[0]}));
    })
/*
    it("should cancel item and refund bounty", async () => {

      let bounty_amount = web3.toWei(1, 'ether');
      let itemHash = "Item Number One";
      let pictureHash = "Picture Hash";

      let instance = await Item.deployed();

      let account_one_starting_balance = await web3.eth.getBalance(accounts[0]);

      let hash = await instance.makeItem.sendTransaction(itemHash, pictureHash, {value: bounty_amount, from: accounts[0]});            // Creates Item

      let tx = await web3.eth.getTransaction(hash);
      let receipt = await web3.eth.getTransactionReceipt(hash);                                                           // Calculates used Gas for Create Item
      let gasCost = tx.gasPrice.mul(receipt.gasUsed);

      let account_one_ending_balance = await web3.eth.getBalance(accounts[0]);
      account_one_ending_balance_check = account_one_starting_balance.minus(gasCost);
      account_one_ending_balance_check = account_one_ending_balance_check.minus(bounty_amount);                           // This is all deductions

      assert.equal(account_one_ending_balance.toNumber(), account_one_ending_balance_check.toNumber(), "Bounty amount for make item wasn't correctly taken from the creator");

      expectThrow(instance.cancelItem.sendTransaction(2, {from: accounts[1]}));                                       // Confirm only owner can cancel item

      hash = await instance.cancelItem.sendTransaction(2, {from: accounts[0]});

      tx = await web3.eth.getTransaction(hash);
      receipt = await web3.eth.getTransactionReceipt(hash);                                                           // Calculates used Gas for Create Item
      gasCost = tx.gasPrice.mul(receipt.gasUsed);

      account_one_ending_balance_check = account_one_ending_balance.minus(gasCost);
      account_one_ending_balance_check = account_one_ending_balance_check.plus(bounty_amount);

      account_one_ending_balance = await web3.eth.getBalance(accounts[0]);

      assert.equal(account_one_ending_balance.toNumber(), account_one_ending_balance_check.toNumber(), "Bounty wasn't refunded to owner.");

      hash = await instance.getItem.call(2, {from: accounts[0]});
      let specificationHash = web3.toAscii(hash[0]).replace(/\0/g, '');
      let owner = hash[1];
      let deliverableHash = hash[2]; // UNUSED
      let bounty = hash[3].toNumber();
      let answerCount = hash[4].toNumber();
      let finalised = hash[5];
      let cancelled = hash[6];
      let acceptedAnswerHash = web3.toAscii(hash[7]).replace(/\0/g, '');

      assert.equal(specificationHash, itemHash, "Item hash wasn't same.");
      assert.equal(owner, accounts[0], "Item owner not correct.");
      assert.equal(bounty, bounty_amount, "Item Bounty not correct.");
      assert.equal(answerCount, 0, "Should be 0 answers.");
      assert.equal(finalised, false, "Item should not be finalised.");
      assert.equal(cancelled, true, "Item should be cancelled.");
    });

    it("should throw when accept called on cancelled item", async () => {
      let instance = await Item.deployed();
      expectThrow(instance.acceptAnswer.sendTransaction(2, 1, {from: accounts[0]}));
    })
    */
})
