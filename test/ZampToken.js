var ZampToken = artifacts.require("./ZampToken.sol");

contract("ZampToken", function (accounts) {
  var tokenInstance;

  // This is to check that the token contract is deployed with the rigth set of value
  // since they are hard coded and initialized upon deployment
  it(" ... checks the initialization of the contract values", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then(function (name) {
        assert.equal(name, "Zamp Token", "has the correct name");
        return tokenInstance.symbol();
      })
      .then(function (symbol) {
        assert.equal(symbol, "ZMP", "has the correct symbol");
        return tokenInstance.decimals();
      })
      .then(function (decimals) {
        assert.equal(decimals, 18, "has the correct decimals");
      });
  });

  // This carefully checks the token contract has the right amount of total supply after
  // it has been deployed.
  it(" ... allocates the TOTAL SUPPLY upon deployment", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function (totalSupply) {
        const val = totalSupply.toString();
        assert.equal(
          val,
          "1000000000000000000000000",
          "the total supply of 1,000,000"
        );

        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function (adminBalance) {
        assert.equal(
          adminBalance.toString(),
          1000000000000000000000000,
          "it allocates the initial supply to the admin account"
        );
      });
  });

  // The transfer function is checked to assert that it cannot transfer more than it has,
  // and that it transfers the right ammount and returns true if successful.
  it(" ... transfer(_to, -val): transfers token ownership", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        // Test `require` statement first by transferring something larger than the sender's balance
        return tokenInstance.transfer.call(
          accounts[1],
          "999999999999999999999999999999999"
        );
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(error.message, "error message");
        return tokenInstance.transfer.call(
          accounts[1],
          "250000000000000000000000",
          {
            from: accounts[0],
          }
        );
      })
      .then(function (success) {
        assert.equal(success, true, "This should return true");
        return tokenInstance.transfer(accounts[1], "250000000000000000000000", {
          from: accounts[0],
        });
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
          accounts[0],
          "should logs the account the tokens were transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          "should logs the account the tokens are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          "250000000000000000000000",
          "should logs the transfer amount"
        );
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toString(),
          "250000000000000000000000",
          "should add the amount to the receiving account"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toString(),
          "750000000000000000000000",
          "should deducts the amount from the sending account"
        );
      });
  });

  // This is to show that the right spender has the given permission to spend the stated amount
  it(" ... approves(_from, _spender, _val): approves tokens for delegated transfer", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then(function (success) {
        assert.equal(success, true, "should returns true");
        return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "should triggers an event");
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          'should be the "Approval" event'
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          " should logs the account the tokens are authorized by"
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          "should logs the account the tokens are authorized to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          100,
          " should logs the transfer amount"
        );
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then(function (allowance) {
        assert.equal(
          allowance.toNumber(),
          100,
          "should stores the allowance for delegated trasnfer"
        );
      });
  });

  // This test for the delegating Token transfer between accounts.
  it(" ... transferFrom(): handles delegated token transfers", function () {
    return ZampToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        // Transfer some tokens to fromAccount
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then(function (receipt) {
        // Approve spendingAccount to spend 10 tokens form fromAccount
        return tokenInstance.approve(spendingAccount, 10, {
          from: fromAccount,
        });
      })
      .then(function (receipt) {
        // Try transferring something larger than the sender's balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than balance"
        );
        // Try transferring something larger than the approved amount
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message,
          "cannot transfer value larger than approved amount"
        );
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then(function (success) {
        assert.equal(success, true);
        return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'should be the "Transfer" event'
        );
        assert.equal(
          receipt.logs[0].args._from,
          fromAccount,
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          toAccount,
          "logs the account the tokens are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          10,
          "logs the transfer amount"
        );
        return tokenInstance.balanceOf(fromAccount);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          90,
          "deducts the amount from the sending account"
        );
        return tokenInstance.balanceOf(toAccount);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          10,
          "adds the amount from the receiving account"
        );
        return tokenInstance.allowance(fromAccount, spendingAccount);
      })
      .then(function (allowance) {
        assert.equal(
          allowance.toNumber(),
          0,
          "deducts the amount from the allowance"
        );
      });
  });
});
