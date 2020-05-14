pragma solidity 0.5.8;

import "./ZampToken.sol";


contract ZampTokenSale {
    using SafeMath for uint256;

    ZampToken public tokenContract;
    address payable adminSale;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(ZampToken _tokenContract, uint256 _tokenPrice) public {
        adminSale = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = (_tokenPrice);
    }

    // This method takes the number of token the buyer wants and
    // converts it to its Wei value befor enabling the tranfer in the
    // token contract
    function buyTokens(uint256 _numberOfTokens)
        public
        payable
        returns (bool succcess)
    {
        uint256 value = SafeMath.mul(_numberOfTokens, (10**18));
        // Makes sure that the buyer makes payment to the admin
        require(msg.value >= (SafeMath.mul(_numberOfTokens, tokenPrice)));
        require(tokenContract.balanceOf(address(this)) >= value);
        tokenContract.transfer(msg.sender, value);

        adminSale.transfer(msg.value);

        // Keeping track of sales progress
        tokensSold += _numberOfTokens;

        return true;
    }

    // There was no need to enable this function to be time constrained since it is only
    // for demo purposes. This implementation enables the contract to be  live at all times.
    // When the sales is ended, the remaining tokens are been trafered to the admin.
    function endSale() public {
        require(msg.sender == adminSale);

        // Just transfer the balance to the admin
        tokenContract.transfer(
            adminSale,
            tokenContract.balanceOf(address(this))
        );
    }
}
