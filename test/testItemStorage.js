const Item = artifacts.require("./ItemStorage.sol");
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

contract('ItemStorage Tests', async (accounts) => {

    // These are used as example hash values for tests
    let itemHash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8';
    let pictureHash = 'Qmb4atcgbbN5v4CDJ8nz5QG5L2pgwSTLd3raDrnyhLjnUH';
    let answer1Hash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLn1z9djWo';
    let answer2Hash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLn9UWrx6Y';
    // Example bounty amount of 1Ether for tests
    let bounty_amount = web3.toWei(1, 'ether');

    let instance;

    it("should have 0 item count on deploy.", async () => {
       instance = await Item.new();
       console.log(instance.address)
       let itemCount = await instance.getItemCount();
       assert.equal(itemCount.valueOf(), 0, "Initial item count incorrect.");
    })

    it("should throw when bounty and msg.value different", async () => {
      // Make sure payable amount is same as bounty
      let itemMultiHash = getBytes32FromMultiash(itemHash);
      let picMultiHash = getBytes32FromMultiash(pictureHash);
      expectThrow(instance.makeItem.sendTransaction(accounts[0], web3.toWei(2, 'ether'), itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: bounty_amount, from: accounts[0]}));
    });

    it("get non-existing item should throw.", async () => {
      expectThrow(instance.getItem(99));
    })

    it("should make item with correct bounty", async () => {
      // Creates item and makes sure bounty amount is deducted from creator
      // Takes sendTransaction gas amount deductions into account for balance check
      let itemMultiHash = getBytes32FromMultiash(itemHash);
      let picMultiHash = getBytes32FromMultiash(pictureHash);

      let account_one_starting_balance = await web3.eth.getBalance(accounts[0]);

      let hash = await instance.makeItem.sendTransaction(accounts[0], bounty_amount, itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: bounty_amount, from: accounts[0]});            // Creates Item

      const tx = await web3.eth.getTransaction(hash);
      const receipt = await web3.eth.getTransactionReceipt(hash);                                                           // Calculates used Gas for Create Item
      const gasCost = tx.gasPrice.mul(receipt.gasUsed);

      let account_one_ending_balance = await web3.eth.getBalance(accounts[0]);
      let account_one_ending_balance_check = account_one_starting_balance.minus(gasCost);
      account_one_ending_balance_check = account_one_ending_balance_check.minus(bounty_amount);                           // This is all deductions

      assert.equal(account_one_ending_balance.toNumber(), account_one_ending_balance_check.toNumber(), "Bounty amount for make item wasn't correctly taken from the creator");
    });

    it("should be one item created", async () => {
      let hash = await instance.getItemCount.call();
      assert.equal(1, hash.toNumber(), "Should be 1 item created.");
    });

    it("getItem should return correct spec hashes", async () => {
      let hash = await instance.getItem.call(1, {from: accounts[0]});
      let specificationHashDigest = hash[0];
      let specificationHashfunction = hash[1].toNumber();
      let specificationHashSize = hash[2].toNumber();

      let output = getMultihashFromBytes32(specificationHashDigest, specificationHashfunction, specificationHashSize);

      assert.equal(itemHash, output, "spec hash should be same");

    });

    it("should be 0 answers for item", async () => {
      let hash = await instance.getItemAnswerCount.call(1);
      assert.equal(0, hash.toNumber(), "Should be 0 answers created for item.");
    });


    it("should return correct pic hashes", async () => {
      let hash = await instance.getItemPicHash.call(1, {from: accounts[0]});
      let picHashDigest = hash[0];
      let picHashfunction = hash[1].toNumber();
      let picHashSize = hash[2].toNumber();

      let output = getMultihashFromBytes32(picHashDigest, picHashfunction, picHashSize);

      assert.equal(pictureHash, output, "pic hash should be same");
    });

    it("should throw when no answers and accepted", async () => {

      expectThrow(instance.acceptAnswer.sendTransaction(1, 0, accounts[0], {from: accounts[0]}));
    });


    it("should create 1 answer for item 1", async () => {
      let answerMultiHash = getBytes32FromMultiash(answer1Hash);

      let hash = await instance.addAnswer.sendTransaction(1, answerMultiHash.digest, answerMultiHash.hashFunction, answerMultiHash.size, accounts[1], {from: accounts[1]});

      hash = await instance.getItemAnswerCount.call(1);
      assert.equal(1, hash.toNumber(), "Should be 1 answer created for item.");
    });

    it("get answer should have correct information", async () => {

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

      let hash = await instance.addAnswer.sendTransaction(1, answerMultiHash.digest, answerMultiHash.hashFunction, answerMultiHash.size, accounts[2], {from: accounts[2]});

      hash = await instance.getItemAnswerCount.call(1);
      assert.equal(2, hash.toNumber(), "Should be 2 answers created for item.");
    });

    it("should throw when incorrect owner accepts answer", async () => {
      expectThrow(instance.acceptAnswer.sendTransaction(1, 2, accounts[1], {from: accounts[1]}));
    });

    it("should have correct status when answer accepted", async () => {
      let hash = await instance.acceptAnswer.sendTransaction(1, 2, accounts[0], {from: accounts[0]});

      hash = await instance.getItem.call(1, {from: accounts[0]});
      let specHashDigest = hash[0];
      let specHashfunction = hash[1].toNumber();
      let specHashSize = hash[2].toNumber();
      let owner = hash[3];
      let bounty = hash[4].toNumber();
      let isAnswered = hash[5];
      let cancelled = hash[6];
      let answerCount = hash[7].toNumber();
      let isBountyCollected = hash[8];

      assert.equal(owner, accounts[0], "Item owner not correct.");
      assert.equal(bounty, bounty_amount, "Item Bounty not correct.");
      assert.equal(isAnswered, true, "Item should be answered.");
      assert.equal(cancelled, false, "Item should not be cancelled.");
      assert.equal(isBountyCollected, false, "Item should not have bounty collected.");
    });

    it("should throw when incorrect owner trys to claim bounty", async () => {
      expectThrow(instance.claimBounty.sendTransaction(1, accounts[0], {from: accounts[0]}));
    });

    it("should transfer bounty to account 2 (correct bounty owner) when account 2 claims bounty", async () => {

      let account_two_starting_balance = await web3.eth.getBalance(accounts[2]);

      let hash = await instance.claimBounty.sendTransaction(1, accounts[2], {from: accounts[2]});
      const tx = await web3.eth.getTransaction(hash);
      const receipt = await web3.eth.getTransactionReceipt(hash);                                                           // Calculates used Gas for Create Item
      const gasCost = tx.gasPrice.mul(receipt.gasUsed);

      let account_two_ending_balance = await web3.eth.getBalance(accounts[2]);

      let account_two_ending_balance_check = account_two_starting_balance.minus(gasCost);                                 // This is all deductions
      account_two_ending_balance_check = account_two_ending_balance_check.plus(bounty_amount);

      assert.equal(account_two_ending_balance.toNumber(), account_two_ending_balance_check.toNumber(), "Amount wasn't correctly sent to correct answer owner.");
    });

    it("finalised item should all be correct", async () => {

      let hash = await instance.getItem.call(1, {from: accounts[0]});
      let specHashDigest = hash[0];
      let specHashfunction = hash[1].toNumber();
      let specHashSize = hash[2].toNumber();
      let owner = hash[3];
      let bounty = hash[4].toNumber();
      let finalised = hash[5];
      let cancelled = hash[6];
      let answerCount = hash[7].toNumber();
      let isBountyCollected = hash[8];

      let specHash = getMultihashFromBytes32(specHashDigest, specHashfunction, specHashSize);

      assert.equal(specHash, itemHash, "Item hash wasn't same.");
      assert.equal(owner, accounts[0], "Item owner not correct.");
      assert.equal(bounty, bounty_amount, "Item Bounty not correct.");
      assert.equal(finalised, true, "Item should be finalised.");
      assert.equal(cancelled, false, "Item should not be cancelled.");
      assert.equal(isBountyCollected, true, "Item should have bounty claimed.");
    });

    it("finalised item answer should be correct", async () => {

      let hash = await instance.getAcceptedAnswer.call(1, {from: accounts[0]});
      let answerHashDigest = hash[0];
      let answerHashfunction = hash[1].toNumber();
      let answerHashSize = hash[2].toNumber();

      let answerHash = getMultihashFromBytes32(answerHashDigest, answerHashfunction, answerHashSize);
      assert.equal(answer2Hash, answerHash, "Answer hash should be same as answer 2.");
    });

    it("should throw when accept called on answer already accepted", async () => {
      expectThrow(instance.acceptAnswer.sendTransaction(1, 2, accounts[0], {from: accounts[0]}));
    });

    it("show throw when cancel called on non-item", async () => {
      expectThrow(instance.cancelItem.sendTransaction(99, accounts[0], {from: accounts[0]}));
    })

    it("should throw when cancel on finalised item", async () => {
      expectThrow(instance.cancelItem.sendTransaction(1, accounts[0], {from: accounts[0]}));
    })

    it("should throw when cancel item called by non-owner", async () => {
      expectThrow(instance.cancelItem.sendTransaction(2, accounts[0], {from: accounts[1]}));
    })

    it("item 2 should not be cancelled or finalised", async () => {

      let itemMultiHash = getBytes32FromMultiash(itemHash);
      let picMultiHash = getBytes32FromMultiash(pictureHash);

      let hash = await instance.makeItem.sendTransaction(accounts[0], bounty_amount, itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: bounty_amount, from: accounts[0]});

      hash = await instance.getItem.call(2, {from: accounts[0]});
      let specificationHash = web3.toAscii(hash[0]).replace(/\0/g, '');
      let specHashDigest = hash[0];
      let specHashfunction = hash[1].toNumber();
      let specHashSize = hash[2].toNumber();
      let owner = hash[3];
      let bounty = hash[4].toNumber();
      let finalised = hash[5];
      let cancelled = hash[6];

      let answerMultiHash = getBytes32FromMultiash(answer1Hash);
      hash = await instance.addAnswer.sendTransaction(2, answerMultiHash.digest, answerMultiHash.hashFunction, answerMultiHash.size, accounts[2], {from: accounts[2]});

      assert.equal(finalised, false, "Item should not be finalised.");
      assert.equal(cancelled, false, "Item should not be cancelled.");
    })

    it("should cancel item 2 and refund bounty", async () => {
      let account_one_starting_balance = await web3.eth.getBalance(accounts[0]);

      let hash = await instance.cancelItem.sendTransaction(2, accounts[0], {from: accounts[0]});

      let tx = await web3.eth.getTransaction(hash);
      let receipt = await web3.eth.getTransactionReceipt(hash);                                                           // Calculates used Gas for Create Item
      let gasCost = tx.gasPrice.mul(receipt.gasUsed);

      let account_one_ending_balance = await web3.eth.getBalance(accounts[0]);
      let account_one_ending_balance_check = account_one_starting_balance.minus(gasCost);
      account_one_ending_balance_check = account_one_ending_balance_check.plus(bounty_amount);

      assert.equal(account_one_ending_balance.toNumber(), account_one_ending_balance_check.toNumber(), "Bounty wasn't refunded to owner.");

      hash = await instance.getItem.call(2, {from: accounts[0]});
      let specificationHash = web3.toAscii(hash[0]).replace(/\0/g, '');
      let specHashDigest = hash[0];
      let specHashfunction = hash[1].toNumber();
      let specHashSize = hash[2].toNumber();
      let owner = hash[3];
      let bounty = hash[4].toNumber();
      let finalised = hash[5];
      let cancelled = hash[6];

      assert.equal(finalised, false, "Item should not be finalised.");
      assert.equal(cancelled, true, "Item should be cancelled.");
    });

    it("should throw when accept called on cancelled item", async () => {
      expectThrow(instance.acceptAnswer.sendTransaction(2, 1, accounts[0], {from: accounts[0]}));
    });

    it("should selfdestruct contract and return bounty to account[0]", async () => {
      let itemMultiHash = getBytes32FromMultiash(itemHash);
      let picMultiHash = getBytes32FromMultiash(pictureHash);

      let hash = await instance.makeItem.sendTransaction(accounts[0], bounty_amount, itemMultiHash.digest, itemMultiHash.hashFunction, itemMultiHash.size, picMultiHash.digest, picMultiHash.hashFunction, picMultiHash.size, {value: bounty_amount, from: accounts[0]});

      let balance = web3.eth.getBalance(instance.address)

      let account_one_starting_balance = await web3.eth.getBalance(accounts[0]);

      hash = await instance.kill.sendTransaction(accounts[0], {from: accounts[0]});

      let tx = await web3.eth.getTransaction(hash);
      let receipt = await web3.eth.getTransactionReceipt(hash);                                                           // Calculates used Gas for Create Item
      let gasCost = tx.gasPrice.mul(receipt.gasUsed);

      let account_one_ending_balance = await web3.eth.getBalance(accounts[0]);
      let account_one_ending_balance_check = account_one_starting_balance.minus(gasCost);
      account_one_ending_balance_check = account_one_ending_balance_check.plus(bounty_amount);

      assert.equal(account_one_ending_balance.toNumber(), account_one_ending_balance_check.toNumber(), "Bounty wasn't refunded to owner.");
    })
});
