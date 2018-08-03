const OracleEthPrice = artifacts.require("OracleEthPrice");

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

contract('Oracle Tests', async (accounts) => {

  it("should set Oracle Eth Price", async () => {

    let oracleInstance = await OracleEthPrice.deployed();

    let setPrice = web3.toWei(1073.10, 'ether');

    await oracleInstance.setEthPrice.sendTransaction(setPrice, {from: accounts[0]});

    let oraclePrice = await oracleInstance.getEthPrice();

    assert.equal(setPrice, oraclePrice.toNumber(), "Oracle price not set correctly.");
  })

  it("should throw when non-owner tries to set Oracle Eth Price", async () => {

    let oracleInstance = await OracleEthPrice.deployed();

    let setPrice = web3.toWei(1073.10, 'ether');

    expectThrow(oracleInstance.setEthPrice.sendTransaction(setPrice, {from: accounts[1]}));
  })

  it("should emit event when updateEthPrice() called", async () => {

    let oracleInstance = await OracleEthPrice.deployed();

    let hash = await oracleInstance.updateEthPrice.sendTransaction({from: accounts[0]});

    oracleInstance.updateEthPrice().then(function(result) {
      //console.log(result)
      //console.log(result.logs)
      assert.equal('CallbackGetEthPrice', result.logs.event, "CallbackGetEthPrice Event not emitted");
    });
  })
});
