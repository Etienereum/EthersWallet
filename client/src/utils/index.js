import { ethers } from "ethers";

function encryptWallet(seedObject, password) {
  function callback(progress) {
    console.log("Encrypting: " + parseInt(progress * 100) + "% complete");
  }

  let encryptPromise = seedObject.encrypt(password, callback);

  encryptPromise.then(function (json) {
    localStorage.setItem("json", JSON.stringify(json));
    console.log(json);
  });
}

export async function decryptWallet(password) {
  let data = JSON.parse(localStorage.getItem("json"));
  try {
    var decryptJson = await ethers.Wallet.fromEncryptedJson(data, password);

    return {
      userAccount: decryptJson.address,
      userPassphrase: decryptJson.mnemonic,
      userPrivateKey: decryptJson.privateKey,
    };
  } catch (err) {
    console.log(err);
  }
}

// Function to Create a New Wallet.
export async function createNewWallet(passwordCreate) {
  console.log("hello");
  if (passwordCreate) {
    var seedObject = ethers.Wallet.createRandom();

    encryptWallet(seedObject, passwordCreate);

    return {
      userAccount: seedObject.address,
      userPassphrase: seedObject.mnemonic,
      userPrivateKey: seedObject.privateKey,
    };
  }
}

// Function to Restore user's Wallet
export async function restoreWallet(mnemonic, password) {
  if (password || mnemonic.split(" ").length === 12) {
    var seedObject = ethers.Wallet.fromMnemonic(mnemonic);

    encryptWallet(seedObject, password);

    return {
      userAccount: seedObject.address,
      userPassphrase: seedObject.mnemonic,
      userPrivateKey: seedObject.privateKey,
    };
  }
}
