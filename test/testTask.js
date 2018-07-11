//import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';
const Task = artifacts.require("Task");

contract('First test', async (accounts) => {
    it("should have 0 task count on deploy.", async () => {
       let instance = await Task.deployed();
       //let balance = await instance.getBalance.call(accounts[0]);
       //assert.equal(balance.valueOf(), 10000);
       let taskCount = await instance.getTaskCount();
       assert.equal(taskCount.valueOf(), 0, "Initial item count incorrect.");
    })

    it("should throw.", async () => {
      let instance = await Task.deployed();

      try {
        await instance.getTask(99);
      } catch (error) {
        // TODO: Check jump destination to destinguish between a throw
        //       and an actual invalid jump.
        const invalidOpcode = error.message.search('invalid opcode') >= 0;
        // TODO: When we contract A calls contract B, and B throws, instead
        //       of an 'invalid jump', we get an 'out of gas' error. How do
        //       we distinguish this from an actual out of gas event? (The
        //       testrpc log actually show an 'invalid jump' event.)
        const outOfGas = error.message.search('out of gas') >= 0;
        assert(
          invalidOpcode || outOfGas,
          "Expected throw, got '" + error + "' instead",
        );

      }
    })

    it("should complete whole process", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];

      let bounty_amount = web3.toWei(1, 'ether');
      let itemHash = "Item No One";

      let instance = await Task.deployed();

      let account_one_starting_balance = await web3.eth.getBalance(account_one);

      console.log("Balance1: " + web3.fromWei(account_one_starting_balance.toNumber()));

      let testGasCost = await instance.makeTask.estimateGas(itemHash, {value: bounty_amount, from: account_one});
      console.log('Estimated Gas cost: ' + testGasCost);
      console.log('Web3 Gas Price: ' + web3.fromWei(web3.eth.gasPrice));

      let hash = await instance.makeTask.sendTransaction(itemHash, {value: bounty_amount, from: account_one});

      const tx = await web3.eth.getTransaction(hash);
      const receipt = await web3.eth.getTransactionReceipt(hash);
      console.log('makeTask receipt: ')
      console.log(receipt)
      const gasCost = tx.gasPrice.mul(receipt.gasUsed);

      console.log('Tx Gas Price: ' + web3.fromWei(tx.gasPrice));
      console.log('Gas Cost: ' + web3.fromWei(gasCost))

      let account_one_ending_balance = await web3.eth.getBalance(account_one);

      account_one_ending_balance_check = account_one_starting_balance.minus(gasCost);
      account_one_ending_balance_check = account_one_ending_balance_check.minus(bounty_amount);

      // Check no items
      assert.equal(account_one_ending_balance.toNumber(), account_one_ending_balance_check.toNumber(), "Bounty amount for make item wasn't correctly taken from the sender");

      hash = await instance.getTaskCount.call();
      console.log('Get TaskCount await:')
      console.log(hash)

      instance.getTaskCount.call().then(function(result) {
        'Get TaskCount .then():'
        console.log(result);
        // BigNumber { s: 1, e: 0, c: [ 1 ] }
        console.log(result.toNumber())
      });

      instance.getAnswerCount.call(1).then(function(result) {
        console.log('Answer Count: ')
        console.log(result);
        // BigNumber { s: 1, e: 0, c: [ 0 ] }
        console.log(result.toNumber())
      });

      hash = await instance.addAnswer.sendTransaction(1, "Answer No 1", {from: account_two});
      // Check no answers

      hash = await instance.addAnswer.sendTransaction(1, "Answer No 2", {from: accounts[2]});
      // Check no answers

      let account_two_starting_balance = await web3.eth.getBalance(accounts[2]);

      console.log("Balance3: " + web3.fromWei(account_two_starting_balance.toNumber()));

      // Check from account_two fails
      hash = await instance.acceptAnswer.sendTransaction(1, 2, {from: account_one});

      hash = await instance.getTask.call(1, {from: account_one});
      let specificationHash = web3.toAscii(hash[0]).replace(/\0/g, '');
      console.log(specificationHash)
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
      assert.equal(answerCount, 2, "Should be 2 answers.");
      assert.equal(finalised, true, "Item should be finalised.");
      assert.equal(cancelled, false, "Item should not be cancelled.");
      assert.equal(acceptedAnswerHash, "Answer No 2", "Accepted answer 2 should be accepted.");

      let account_two_ending_balance = await web3.eth.getBalance(accounts[2]);
      console.log("Balance3 End: " + web3.fromWei(account_two_ending_balance.toNumber()));

      assert.equal(account_two_ending_balance.toNumber(), account_two_starting_balance.plus(bounty_amount).toNumber(), "Amount wasn't correctly sent to correct answer owner.");
    });
})
