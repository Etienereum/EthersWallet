# Token Wallet Application

## Introduction

This project is a Wallet implementation with the [Truffle](https://www.trufflesuite.com/)
for the Zamp token project, using [Ethers.js](https://docs.ethers.io/ethers.js/html/index.html) and [Web3.js](https://web3js.readthedocs.io/en/v1.2.6/index.html) Libraries. The UI is developed with ReactJS. The contracts are deployed on the
[Ropsten Network](https://ropsten.etherscan.io/), and the deployed_addresses.txt file has the deployment details. My [Infura API](https://infura.io/) (for Ropsten Network) was used for the contract deployment and interactions. Also, these contracts can be [verified](https://ropsten.etherscan.io/address/#code) on the Ropsten Network.

Although it was configured to handle the Zamp Token (My Testnet Token), it is designed to be generic, i.e it can be used for other tokens and coins. The heavy lifting is done by the ethers.js lib.

## Explanations

#### 1) Blockchain Wallets:

As a Wallet, it has the functionality of Key management and token transfer. It shows your Account Address, Account balance and Aaccount Transaction history.

### `Why I built this Wallet`

It shows my understanding of how wallets work, this icludes the Key management, it encryption and decryption, listening for events, signing transactions and messages, connecting with a web3 providers over JSONRPC APIs etc.
