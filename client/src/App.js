import React, { Component } from "react";
import ZampToken from "./contracts/ZampToken.json";
import abi from "./JSONcontract/ZampToken.json";
import { decryptWallet, createNewWallet, restoreWallet } from "./utils";

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

      if (data) {
        let pwd = prompt("Enter Password");
        let decrypt = await decryptWallet(pwd);
        this.setState(decrypt);
      } else {
        let pwd2 = prompt("Enter Password for a new wallet");
        let createWallet = await this.createNewWallet(pwd2);
        this.setState(createWallet);
      }

      // Set the Ethers.js Network Connection
      let provider = new ethers.providers.JsonRpcProvider(
        "https://ropsten.infura.io/v3/22161cf82bde4bddb913365af130ff7e"
      );

      try {
        const { userPrivateKey } = this.state;

        // Wallet Setup and Contract Connection
        let wallet = new ethers.Wallet(userPrivateKey, provider);

        // Connecting to the Contract on the chain
        let contract = new ethers.Contract(
          deployedNetwork.address,
          abi,
          provider
        );

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
    } catch (error) {
      console.error(error);
    }
  };

  runLoader = async () => {
    const { userAccount, tokenInstance } = this.state;

    // Get the Transfer Events of the Current Account.
    var txn = await tokenInstance.getPastEvents("Transfer", {
      filter: { _from: userAccount },
      fromBlock: 0,
      toBloack: "lastest",
    });

    this.setState({ transactions: txn });
    console.log(txn);
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
        <h3>Total Suppy: {this.state.totalSupply} ZMP</h3>
        <p>
          Your Account: {this.state.userAccount}, has a balance of{" "}
          {this.state.userBalance} ZMP.
        </p>

        {/* Create New Wallet */}
        <div className="content mr-auto ml-auto" style={{ width: "740px" }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const passwordCreate = this.passwordCreate.value;
              createNewWallet(passwordCreate);
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
              restoreWallet(mnemonic, password);
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
