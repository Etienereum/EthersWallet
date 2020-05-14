var ZampToken = artifacts.require("./ZampToken.sol");
var ZampTokenSale = artifacts.require("./ZampTokenSale.sol");

contract("ZampTokenSale", function (accounts) {
  var tokenInstance;
  var tokenSaleInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenPrice = 1000000000000000; // in wei (0.001ETH)
  var tokensAvailable = "750000000000000000000000";
  var numberOfTokens;

  // It checks that the Sales contract is deployed with the rigth set of value
  // when initialized at deployment
  it(" ... sales contract is initialized with correct values", function () {
    return ZampTokenSale.deployed()
      .then(function (instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then(function (address) {
        assert.notEqual(address, 0x0, "has contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then(function (address) {
        assert.notEqual(address, 0x0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then(function (price) {
        assert.equal(price, tokenPrice, "token price is correct");
      });
  });

  // After deployment, the admin manually sets a certain percentage of the token to the
  // Sales contract and this process is very important.
  // This test is to check for tranfer correctness.
  it(" ... set 75% of the token by transfering it to the contract", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        // get the token instance
        tokenInstance = instance;
        return ZampTokenSale.deployed();
      })
      .then(function (instance) {
        // get the token sale instance
        tokenSaleInstance = instance;
        // Tranasfer 75% of the tokens to the sales contract address
        return tokenInstance.transfer.call(
          tokenSaleInstance.address,
          tokensAvailable,
          { from: admin }
        );
      })
      .then(function (success) {
        assert.equal(success, true, "This should return true");
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokensAvailable,
          {
            from: admin,
          }
        );
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "It triggers a 'Transfer' event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'should emit the "Transfer" event'
        );
        assert.equal(
          receipt.logs[0].args._from,
          admin,
          "should log admin account as account the tokens were transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          tokenSaleInstance.address,
          "should logs the buyer account as where the token is transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          "750000000000000000000000",
          "should log the transfered amount of tokens"
        );
        return tokenInstance.balanceOf(admin);
      })
      .then(function (balance) {
        assert.equal(
          balance.toString(),
          "250000000000000000000000",
          "should log the amount left in the admin account"
        );
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function (balance) {
        assert.equal(
          balance.toString(),
          "750000000000000000000000",
          "should log the amount in the contract account"
        );
      });
  });

  // This is to test the buyToken() method if it return true, if it transfers the right
  // amount and if it deduces the right ether from the buyer's account
  it(" ... makes token purchase from the contract account", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        // get the token instance
        tokenInstance = instance;
        return ZampTokenSale.deployed();
      })
      .then(function (instance) {
        // get the token sale instance
        tokenSaleInstance = instance;
        numberOfTokens = 10;
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "It should emit the 'Sell event'");
        assert.equal(
          receipt.logs[0].event,
          "Sell",
          'should log the "Sell" event'
        );
        assert.equal(
          receipt.logs[0].args.buyer,
          buyer,
          "should log the account that purchased the tokens"
        );
        assert.equal(
          receipt.logs[0].args.amount,
          numberOfTokens,
          "should log the number of tokens purchased"
        );
        return tokenSaleInstance.tokensSold();
      })
      .then(function (amount) {
        console.log(amount);
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          " ... the number of tokens sold"
        );
        return tokenInstance.balanceOf(buyer);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), numberOfTokens),
          "is wrong: not balanced";
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        // Try to buy tokens different from the ether value
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(error.message, "msg.value must equal number of tokens in wei");
        return tokenSaleInstance.buyTokens(800000, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message,
          "should not purchase more than the available Token"
        );
      });
  });

  // This ends the token Sale by simply making sure that the remaining tokens are
  // tranferred to the admin
  it(" ... ending token saleby the admin only", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return ZampTokenSale.deployed();
      })
      .then(function (instance) {
        // grab token sale instance
        tokenSaleInstance = instance;
        // Try to end sale from account other than the admin
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(error.message, "must be admin to end sale");
        // Ending sale from the admin account
        return tokenSaleInstance.endSale({ from: admin });
      });
  });

  // It is very important to see that all assets or tokens are transfer form the contract
  // to the admin at the end of the Sale.
  // This test verifies that the admin and the Sales Contract accounts have the right balanced.
  it(" ... Ckecking Admin and contract accounts for the right bablances", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        // grab token instance
        tokenInstance = instance;
        return ZampTokenSale.deployed();
      })
      .then(function (instance) {
        // grab token sale instance
        tokenSaleInstance = instance;
        return tokenInstance.balanceOf(admin);
      })
      .then(function (balance) {
        assert.equal(
          balance.toString(),
          "999990000000000000000000",
          "returns all unsold dapp tokens to admin"
        );
        //Check that the contract address is 0
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), 0, "balance should be 0");
      });
  });
});
