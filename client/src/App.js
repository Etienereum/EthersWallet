import React, { Component } from "react";
import ZampToken from "./contracts/ZampToken.json";
import abi from "./JSONcontract/ZampToken.json";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import web3 from "web3";
import getWeb3 from "./getWeb3"; // ... to get Web3 Connection
import { ethers } from "ethers";

class App extends Component {
  state = {
    web13: null,
    tokenInstance: null,
    transactions: [],

    contract: null,
    totalSupply: 0,

    userAccount: null,
    userBalance: 0,

    userPassphrase: null,
    userPrivateKey: null,
    contractWithSigner: null,
  };

  componentDidMount = async () => {
    try {
      // Set the network provider and web3 instance.
      const web13 = await getWeb3();
      const networkId = await web13.eth.net.getId();

      const deployedNetwork = ZampToken.networks[networkId];
      const tokenInstance = new web13.eth.Contract(
        ZampToken.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Getting Encrypted data from the browser localstorage
      let data = JSON.parse(localStorage.getItem("json"));

      var pwd = prompt("Enter Password");
      if (data) {
        this.decryptWallet(pwd);
      } else {
        let pwd2 = prompt("Enter Password for a new wallet");
        this.createNewWallet(pwd2);
      }

      // Set the Ethers.js Network Connection
      let provider = new ethers.providers.JsonRpcProvider(
        "https://ropsten.infura.io/v3/22161cf82bde4bddb913365af130ff7e"
      );

      setTimeout(async () => {
        try {
          const { userPrivateKey } = this.state;

          // Wallet Setup and Contract Connection
          let wallet = new ethers.Wallet(userPrivateKey, provider);
          let contractAddress = "0x6361Ee5057913Ee974cb55851bDF8adA1846A139";

          // Connecting to the Contract on the chain
          let contract = new ethers.Contract(contractAddress, abi, provider);

          // Current user's Signer Object
          let contractWithSigner = contract.connect(wallet);

          // Zamp Tokens Total Supply.
          const supply = await contractWithSigner.totalSupply();
          const supplyFromWei = web3.utils.fromWei(supply.toString(), "ether");

          // User's accounts balance.
          const balance = await contractWithSigner.balanceOf(wallet.address);
          const balFromWei = web3.utils.fromWei(balance.toString(), "ether");

          this.setState(
            {
              contract,
              tokenInstance,
              contractWithSigner,
              totalSupply: supplyFromWei,
              userBalance: balFromWei,
            },
            this.runLoader
          );
        } catch (err) {
          console.log(err);
        }
      }, 10000);
    } catch (error) {
      console.error(error);
    }
  };

  runLoader = async () => {
    const { userAccount, tokenInstance } = this.state;

    // Get the Transfer Events of the Current Account.
    var txn = await tokenInstance.getPastEvents("Transfer", {
      filter: { from: userAccount },
      fromBlock: 0,
      toBloack: "lastest",
    });

    this.setState({ transactions: txn });
    console.log(txn);
  };

  encryptWallet = async (seedObject, password) => {
    function callback(progress) {
      console.log("Encrypting: " + parseInt(progress * 100) + "% complete");
    }

    let encryptPromise = seedObject.encrypt(password, callback);

    encryptPromise.then(function (json) {
      localStorage.setItem("json", JSON.stringify(json));
      console.log(json);
    });
  };

  decryptWallet = async (password) => {
    let data = JSON.parse(localStorage.getItem("json"));
    try {
      var decryptJson = await ethers.Wallet.fromEncryptedJson(data, password);

      this.setState({
        userAccount: decryptJson.address,
        userPassphrase: decryptJson.mnemonic,
        userPrivateKey: decryptJson.privateKey,
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Create a New Wallet.
  createNewWallet = async (passwordCreate) => {
    if (passwordCreate) {
      var seedObject = ethers.Wallet.createRandom();

      this.setState({
        userAccount: seedObject.address,
        userPassphrase: seedObject.mnemonic,
        userPrivateKey: seedObject.privateKey,
      });

      this.encryptWallet(seedObject, passwordCreate);
    }
  };

  // Function to Restore user's Wallet
  restoreWallet = async (mnemonic, password) => {
    if (password || mnemonic.split(" ").length === 12) {
      var seedObject = ethers.Wallet.fromMnemonic(mnemonic);

      this.setState({
        userAccount: seedObject.address,
        userPassphrase: seedObject.mnemonic,
        userPrivateKey: seedObject.privateKey,
      });

      this.encryptWallet(seedObject, password);
    }
  };

  // Zamp Token transfer function.
  transferZamp = async (recipient, transferAmt) => {
    const { contractWithSigner } = this.state;

    try {
      // Converting the number of token to transfer to Wei
      var transferAmtToWei = web3.utils.toWei(transferAmt, "ether");

      let tx = await contractWithSigner.transfer(recipient, transferAmtToWei);

      await tx.wait();

      console.log(transferAmtToWei, " ZMP was transfered");
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    return (
      <div className="App">
        <h2>ZampToken Wallet Application</h2>
        <hr />
        <p>ZampToken Total Suppy = {this.state.totalSupply}ZMP</p>
        <p>
          Your Account, {this.state.userAccount}, currently has a balance of{" "}
          {this.state.userBalance} ZMP.{" "}
        </p>

        {/* Create New Wallet */}
        <div className="content mr-auto ml-auto" style={{ width: "740px" }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const passwordCreate = this.passwordCreate.value;
              this.createNewWallet(passwordCreate);
            }}
          >
            <div className="form-group">
              <div className="input-group">
                <input
                  id="newWalletPWD"
                  type="text"
                  ref={(input) => {
                    this.passwordCreate = input;
                  }}
                  className="form-control input-lg"
                  placeholder="Password ... "
                  required
                />
                <span className="input-group-btn">
                  <button type="submit" className="btn btn-primary btn-block">
                    Create New Wallet
                  </button>
                </span>
              </div>
            </div>
          </form>
        </div>
        <hr />

        {/* Restore a Wallet */}
        <div className="content mr-auto ml-auto" style={{ width: "740px" }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const mnemonic = this.mnemonic.value;
              const password = this.password.value;
              this.restoreWallet(mnemonic, password);
            }}
          >
            <div className="form-group">
              <div className="input-group">
                <input
                  id="restoreWallet"
                  type="text"
                  ref={(input) => {
                    this.mnemonic = input;
                  }}
                  className="form-control input-lg"
                  placeholder="Passphrase"
                  required
                />
                <input
                  id="restoreWallet"
                  type="text"
                  ref={(input) => {
                    this.password = input;
                  }}
                  className="form-control input-lg"
                  placeholder="Password"
                  required
                />
                <span className="input-group-btn">
                  <button type="submit" className="btn btn-primary btn-block">
                    Restore Wallet
                  </button>
                </span>
              </div>
            </div>
          </form>
        </div>
        <hr />

        {/* For Zamp Token transfer */}
        <div className="content mr-auto ml-auto" style={{ width: "740px" }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const recipient = this.recipient.value;
              const transferAmt = this.transferAmt.value;
              this.transferZamp(recipient, transferAmt);
              console.log(transferAmt);
            }}
          >
            <div className="form-group">
              <div className="input-group">
                <input
                  id="recipient"
                  type="text"
                  ref={(input) => {
                    this.recipient = input;
                  }}
                  className="form-control input-lg"
                  placeholder="Recipient Address"
                  required
                />
                <input
                  id="transferAmt"
                  type="text"
                  ref={(input) => {
                    this.transferAmt = input;
                  }}
                  className="form-control input-lg"
                  placeholder="Amount"
                  required
                />
                <span className="input-group-btn">
                  <button type="submit" className="btn btn-primary btn-block">
                    Send Rever
                  </button>
                </span>
              </div>
            </div>
          </form>
        </div>
        <hr />

        {/* Getting userAccount Transaction History using "Tranfer Event"*/}
        <div className="container" style-prop="width: 450px;">
          <strong>Transcation History</strong>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Recipient</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {this.state.transactions.map((tx, index) => {
                // Getting data from the transactions array for the transaction history
                return (
                  <tr key={index}>
                    <td> {tx.returnValues._to} </td>
                    <td>
                      {web3.utils.fromWei(
                        tx.returnValues._value.toString(),
                        "ether"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
