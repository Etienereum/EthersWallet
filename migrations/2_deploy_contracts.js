var ZampToken = artifacts.require("./ZampToken.sol");
var ZampTokenSale = artifacts.require("./ZampTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(ZampToken, 1000000).then(function () {
    // Token price is set to 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(ZampTokenSale, ZampToken.address, tokenPrice);
  });
};
