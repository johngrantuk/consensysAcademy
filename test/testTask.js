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

      let bounty_amount = 10;
      let itemHash = "Item No One";

      let instance = await Task.deployed();

      let account_one_starting_balance = await web3.eth.getBalance(account_one);
      let account_two_starting_balance = await web3.eth.getBalance(account_two);

      console.log("Balance1: " + account_one_starting_balance.toNumber());
      console.log("Balance2: " + account_two_starting_balance.toNumber())

      let testGasCost = await instance.makeTask.estimateGas(itemHash, {value: web3.toWei(bounty_amount, 'ether'), from: account_one});
      console.log('Estimated Gas cost: ' + testGasCost);
      console.log('Web3 Gas Price: ' + web3.fromWei(web3.eth.gasPrice));

      let hash = await instance.makeTask.sendTransaction(itemHash, {value: web3.toWei(bounty_amount, 'ether'), from: account_one});

      const tx = await web3.eth.getTransaction(hash);
      const receipt = await web3.eth.getTransactionReceipt(hash);
      console.log(receipt)
      const gasCost = tx.gasPrice.mul(receipt.gasUsed);

      console.log('Tx Gas Price: ' + web3.fromWei(tx.gasPrice));
      console.log('Gas Cost: ' + web3.fromWei(gasCost))

      let account_one_ending_balance = await web3.eth.getBalance(account_one);

      account_one_ending_balance_check = account_one_starting_balance.minus(gasCost);
      account_one_ending_balance_check = account_one_ending_balance_check.minus(web3.toWei(bounty_amount, 'ether'));

      // Check no items
      assert.equal(account_one_ending_balance.toNumber(), account_one_ending_balance_check.toNumber(), "Bounty amount for make item wasn't correctly taken from the sender");

      hash = await instance.getTaskCount.call();
      console.log(hash)
      console.log("Other:")
      instance.getTaskCount.call().then(function(result) {
        console.log(result);
      });

      instance.getAnswerCount.call(1).then(function(result) {
        console.log(result);
      });


      console.log('1')
      hash = await instance.addAnswer.sendTransaction(1, "Answer No 1", {from: account_two});
      // Check no answers
      console.log('2')
      hash = await instance.addAnswer.sendTransaction(1, "Answer No 2", {from: accounts[2]});
      // Check no answers
      console.log('3')
      // Check from account_two fails
      hash = await instance.acceptAnswer.sendTransaction(1, 1, {from: account_one});
      console.log('4')
      hash = await instance.getTask.call(1, {from: account_one});
      console.log(hash)
      /*
      let account_two_ending_balance = await web3.eth.getBalance(account_two);

      assert.equal(account_two_ending_balance, account_two_starting_balance.plus(bounty_amount), "Amount wasn't correctly sent to the receiver");

      let test = account_one_starting_balance.plus(10);

      assert.equal(test.toNumber(), account_one_starting_balance.toNumber(), "Testing testing");
      */
    });

/*
    it("should complete whole process", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];

      let bounty_amount = 10;
      let itemHash = "Item No One";

      let instance = await Task.deployed();

      let balance = await web3.eth.getBalance(account_one);
      BigNumber account_one_starting_balance = web3.fromWei(balance.toNumber(), "ether");
      balance = await web3.eth.getBalance(account_two);
      BigNumber account_two_starting_balance = web3.fromWei(balance.toNumber(), "ether");

      console.log(typeof(account_one_starting_balance))
      console.log(typeof(account_two_starting_balance))

      let estGasCost = await instance.makeTask.estimateGas(itemHash, {value: web3.toWei(bounty_amount, 'ether'), from: account_one});
      console.log('Estimated Gas cost: ' + estGasCost);
      console.log('Gas Price: ' + web3.fromWei(web3.eth.gasPrice));
      let hash = await instance.makeTask.sendTransaction(itemHash, {value: web3.toWei(bounty_amount, 'ether'), from: account_one});

      const tx = await web3.eth.getTransaction(hash);
      const receipt = await web3.eth.getTransactionReceipt(hash);
      const gasCost = tx.gasPrice.mul(receipt.gasUsed);

      console.log('Tx Gas Price: ' + web3.fromWei(tx.gasPrice));
      console.log('Gas Cost: ' + web3.fromWei(gasCost))

      balance = await web3.eth.getBalance(account_one);
      let account_one_ending_balance = web3.fromWei(balance.toNumber(), "ether");
      balance = await web3.eth.getBalance(account_two);
      let account_two_ending_balance = web3.fromWei(balance.toNumber(), "ether");

      assert.equal(account_one_ending_balance, account_one_starting_balance.plus(web3.fromWei(gasCost).minus(bounty_amount)), "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance.plus(bounty_amount), "Amount wasn't correctly sent to the receiver");

    });
    */
    /*
    it("should revert.", async () => {
      let instance = await Task.deployed();

      try {
        await instance.getTask(99);
        assert.fail('Expected revert not received');
      } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
      }
    })
    */
})
/*
contract('2nd MetaCoin test', async (accounts) => {

  it("should put 10000 MetaCoin in the first account", async () => {
     let instance = await MetaCoin.deployed();
     let balance = await instance.getBalance.call(accounts[0]);
     assert.equal(balance.valueOf(), 10000);
  })

  it("should call a function that depends on a linked library", async () => {
    let meta = await MetaCoin.deployed();
    let outCoinBalance = await meta.getBalance.call(accounts[0]);
    let metaCoinBalance = outCoinBalance.toNumber();
    let outCoinBalanceEth = await meta.getBalanceInEth.call(accounts[0]);
    let metaCoinEthBalance = outCoinBalanceEth.toNumber();
    assert.equal(metaCoinEthBalance, 2 * metaCoinBalance);

  });

  it("should send coin correctly", async () => {

    // Get initial balances of first and second account.
    let account_one = accounts[0];
    let account_two = accounts[1];

    let amount = 10;


    let instance = await MetaCoin.deployed();
    let meta = instance;

    let balance = await meta.getBalance.call(account_one);
    let account_one_starting_balance = balance.toNumber();

    balance = await meta.getBalance.call(account_two);
    let account_two_starting_balance = balance.toNumber();
    await meta.sendCoin(account_two, amount, {from: account_one});

    balance = await meta.getBalance.call(account_one);
    let account_one_ending_balance = balance.toNumber();

    balance = await meta.getBalance.call(account_two);
    let account_two_ending_balance = balance.toNumber();

    assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
    assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
  });

})
*/
