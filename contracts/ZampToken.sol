pragma solidity 0.5.8;


/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * or underflow checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs. This is a recommended practice to always use SafeMath.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers or
     * reverts when there is an overflow.
     *
     * Solidity's `+` operator.
     *
     * Requirements:- Addition cannot overflow.
     */
    function add(uint256 _a, uint256 _b) internal pure returns (uint256) {
        uint256 _c = _a + _b;
        require(_c >= _a, "SafeMath: addition overflow");

        return _c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers or
     * reverts when it overflow (i.e. when the result is negative).
     *
     * Solidity's `-` operator.
     *
     * Requirements:- Subtraction cannot overflow.
     */
    function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
        return sub(_a, _b, "SafeMath: subtraction overflow");
    }

    /**
     * Subtraction implementation
     */
    function sub(uint256 _a, uint256 _b, string memory errorMessage)
        internal
        pure
        returns (uint256)
    {
        require(_b <= _a, errorMessage);
        uint256 _c = _a - _b;

        return _c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers or
     * reverts on overflow.
     *
     * Solidity's `*` operator.
     *
     * Requirements:- Multiplication cannot overflow.
     */
    function mul(uint256 _a, uint256 _b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than using 'require (a ==0),
        // but this benefit is lost if 'b' is also tested.
        // Reference: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (_a == 0) {
            return 0;
        }

        uint256 _c = _a * _b;
        require(_c / _a == _b, "SafeMath: multiplication overflow");

        return _c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers or
     * Reverts when division is by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:- The divisor cannot be zero.
     */
    function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
        return div(_a, _b, "SafeMath: division by zero");
    }

    /**
     * Division implementation
     *
     * @dev Returns the integer division of two unsigned integers or reverts
     * with custom message on division by zero.
     */
    function div(uint256 _a, uint256 _b, string memory errorMessage)
        internal
        pure
        returns (uint256)
    {
        // Solidity only automatically asserts when dividing by 0
        require(_b > 0, errorMessage);
        uint256 _c = _a / _b;
        // assert(_a == _b * _c + _a % _b); // There is no case in which this doesn't hold

        return _c;
    }
}


/**
 * @title Owned
 *
 * @dev Owned contract - Implements a simple ownership model with 2-phase transfer
 * functions to let the owner sets transfer the ownership control. It can transfer
 * the ownership to a new owner through making a proposedOwner.
 */
contract Ownable {
    address public owner;
    address public proposedOwner;

    event OwnershipTransferInitiated(address indexed _proposedOwner);
    event OwnershipTransferCompleted(address indexed _newOwner);
    event OwnershipTransferCanceled();

    /**
     * @dev The Owned constructor sets the original `owner` of the contract to the
     * creator's account.
     */
    constructor() public {
        owner = msg.sender;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner(msg.sender) == true);
        _;
    }

    function isOwner(address _address) public view returns (bool) {
        return (_address == owner);
    }

    /**
     * @dev Allows the owner to initiate and Ownership control of the contract to a newOwner.
     *
     * @param _proposedOwner - The address to initiateOwnershipTransfer to.
     */
    function initiateOwnershipTransfer(address _proposedOwner)
        public
        onlyOwner
        returns (bool)
    {
        require(_proposedOwner != address(0));
        require(_proposedOwner != address(this));
        require(_proposedOwner != owner);

        proposedOwner = _proposedOwner;

        emit OwnershipTransferInitiated(proposedOwner);

        return true;
    }

    /**
     * @dev Allows for the cancellation of the OwnershipTransfer
     */
    function cancelOwnershipTransfer() public onlyOwner returns (bool) {
        if (proposedOwner == address(0)) {
            return true;
        }

        proposedOwner = address(0);

        emit OwnershipTransferCanceled();

        return true;
    }

    /**
     * @dev Allows for the finalization of the initiated Ownership Transfer
     */
    function completeOwnershipTransfer() public returns (bool) {
        require(msg.sender == proposedOwner);

        owner = msg.sender;
        proposedOwner = address(0);

        emit OwnershipTransferCompleted(owner);

        return true;
    }
}


/**
 * @title  contract
 *
 * @dev Contract mechanism which allows for the implement an emergency stop.
 */
contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(paused);
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Pause();
    }

    /**
     * @dev Called by the owner to unpause, returns to normal state
     */
    function unpause() public onlyOwner whenPaused {
        paused = false;
        emit Unpause();
    }
}


/**
 * @title ERC20Interface - Standard ERC20 Interface Definition based on the final
 * specification at:
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
 *
 * @dev Also, you can see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20Interface {
    uint256 _totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    function totalSupply() public view returns (uint256);

    function balanceOf(address _owner) public view returns (uint256);

    function transfer(address _to, uint256 _value)
        public
        returns (bool success);

    function transferFrom(address _from, address _to, uint256 _value)
        public
        returns (bool success);

    function approve(address _spender, uint256 _value)
        public
        returns (bool success);

    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256 remaining);
}


/**
 * @title StandardToken
 *
 * @dev Implementation of the Interface of the ERC20 standard token.
 */
contract StandardToken is Ownable, ERC20Interface {
    using SafeMath for uint256;

    uint256 public constant MAX_UINT = 2**256 - 1;

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowed;

    // Variables for setting transaction fees if it ever becames necessary
    uint256 public basisPointsRate = 0;
    uint256 public maximumFee = 0;

    // A fix for the ERC20 short address attack.
    modifier onlyPayloadSize(uint256 size) {
        require(!(msg.data.length < size + 4));
        _;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param _owner The address to query the the balance of.
     * @return An uint representing the amount owned by the passed address.
     */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    /**
     * @dev transfer token for a specified address
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transfer(address _to, uint256 _value)
        public
        onlyPayloadSize(2 * 32)
        returns (bool success)
    {
        uint256 fee = (_value.mul(basisPointsRate)).div(10000);
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        uint256 sendAmount = _value.sub(fee);
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(sendAmount);
        if (fee > 0) {
            balances[owner] = balances[owner].add(fee);
            emit Transfer(msg.sender, owner, fee);
        }
        emit Transfer(msg.sender, _to, sendAmount);

        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint the amount of tokens to be transferred
     */
    function transferFrom(address _from, address _to, uint256 _value)
        public
        onlyPayloadSize(3 * 32)
        returns (bool success)
    {
        uint256 _allowance = allowed[_from][msg.sender];

        // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
        // if (_value > _allowance) throw;

        uint256 fee = (_value.mul(basisPointsRate)).div(10000);
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        if (_allowance < MAX_UINT) {
            allowed[_from][msg.sender] = _allowance.sub(_value);
        }
        uint256 sendAmount = _value.sub(fee);
        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(sendAmount);
        if (fee > 0) {
            balances[owner] = balances[owner].add(fee);
            emit Transfer(_from, owner, fee);
        }
        emit Transfer(_from, _to, sendAmount);

        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value)
        public
        onlyPayloadSize(2 * 32)
        returns (bool success)
    {
        // To change the approve amount you first have to reduce the addresses`
        // allowance to zero by calling `approve(_spender, 0)` if it is not
        // already 0
        require(!((_value != 0) && (allowed[msg.sender][_spender] != 0)));

        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    /**
     * @dev Function to check the amount of tokens than an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint specifying the amount of tokens still available for the spender.
     */
    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256 remaining)
    {
        return allowed[_owner][_spender];
    }
}


/**
 * The BlackList Contract controls malicious activities and ensures that it is only
 * called by the Admin
 */
contract BlackList is Ownable, StandardToken {
    mapping(address => bool) public isBlackListed;

    event AddedBlackList(address _user);
    event RemovedBlackList(address _user);
    event DestroyedBlackFunds(address _blackListedUser, uint256 _balance);

    // Getters to allow the same blacklist to be used also by other contracts
    function getBlackListStatus(address _maker) external view returns (bool) {
        return isBlackListed[_maker];
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function addBlackList(address _evilUser) public onlyOwner {
        isBlackListed[_evilUser] = true;
        emit AddedBlackList(_evilUser);
    }

    function removeBlackList(address _clearedUser) public onlyOwner {
        isBlackListed[_clearedUser] = false;
        emit RemovedBlackList(_clearedUser);
    }

    function destroyBlackFunds(address _blackListedUser) public onlyOwner {
        require(isBlackListed[_blackListedUser]);
        uint256 dirtyFunds = balanceOf(_blackListedUser);
        balances[_blackListedUser] = 0;
        _totalSupply -= dirtyFunds;
        emit DestroyedBlackFunds(_blackListedUser, dirtyFunds);
    }
}


/**
 * UpgradedERC20Token Contract - Implement methods which are called as legacy
 */
contract UpgradedERC20Token is StandardToken {
    function transferByLegacy(address from, address to, uint256 value)
        public
        returns (bool success);

    function transferFromByLegacy(
        address sender,
        address from,
        address spender,
        uint256 value
    ) public returns (bool success);

    function approveByLegacy(address from, address spender, uint256 value)
        public
        returns (bool success);
}


/**
 * ERC20 Compatible Token
 * The token is a standard ERC20 Token, with the addition of a few
 * concepts such as: Contract Deprecation, Upgradabl Contracts, Emergency Stop etc
 */
contract ZampToken is Pausable, StandardToken, BlackList {
    string internal tokenName;
    string internal tokenSymbol;
    uint8 internal tokenDecimals;
    uint256 internal tokenTotalSupply;
    uint256 internal decimalsfactor = 10**uint256(tokenDecimals);

    bool public deprecated;
    address public upgradedAddress;

    event Issue(uint256 amount);
    event Redeem(uint256 amount);
    event Deprecate(address newAddress);
    event Params(uint256 feeBasisPoints, uint256 maxFee);

    constructor(uint256 _initialSupply) public {
        tokenName = "Zamp Token";
        tokenSymbol = "ZMP";
        tokenDecimals = 18;
        tokenTotalSupply = (_initialSupply * 10**uint256(tokenDecimals));

        balances[owner] = tokenTotalSupply;
        deprecated = false;
    }

    function name() public view returns (string memory) {
        return tokenName;
    }

    function symbol() public view returns (string memory) {
        return tokenSymbol;
    }

    function decimals() public view returns (uint8) {
        return tokenDecimals;
    }

    // Forward ERC20 methods to upgraded contract if this one is deprecated
    function transfer(address _to, uint256 _value)
        public
        whenNotPaused
        returns (bool success)
    {
        require(!isBlackListed[msg.sender]);
        if (deprecated) {
            UpgradedERC20Token(upgradedAddress).transferByLegacy(
                msg.sender,
                _to,
                _value
            );
        } else {
            super.transfer(_to, _value);
        }

        return true;
    }

    // Forward ERC20 methods to upgraded contract if this one is deprecated
    function transferFrom(address _from, address _to, uint256 _value)
        public
        whenNotPaused
        returns (bool success)
    {
        require(!isBlackListed[_from]);
        if (deprecated) {
            UpgradedERC20Token(upgradedAddress).transferFromByLegacy(
                msg.sender,
                _from,
                _to,
                _value
            );
        } else {
            super.transferFrom(_from, _to, _value);
        }
        return true;
    }

    // Gives the Balance Of an Account when the contract is deprecated
    function balanceOf(address who) public view returns (uint256) {
        if (deprecated) {
            return UpgradedERC20Token(upgradedAddress).balanceOf(who);
        } else {
            return super.balanceOf(who);
        }
    }

    // Forward approve methods to upgraded contract if this one is deprecated
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        if (deprecated) {
            UpgradedERC20Token(upgradedAddress).approveByLegacy(
                msg.sender,
                _spender,
                _value
            );
        } else {
            super.approve(_spender, _value);
        }
        return true;
    }

    // Forward allowance methods to upgraded contract if this one is deprecated
    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256 remaining)
    {
        if (deprecated) {
            return StandardToken(upgradedAddress).allowance(_owner, _spender);
        } else {
            return super.allowance(_owner, _spender);
        }
    }

    // deprecate current contract in favour of a new one
    function deprecate(address _upgradedAddress) public onlyOwner {
        deprecated = true;
        upgradedAddress = _upgradedAddress;
        emit Deprecate(_upgradedAddress);
    }

    // Provides the Total Supply of the contract
    function totalSupply() public view returns (uint256) {
        if (deprecated) {
            return StandardToken(upgradedAddress).totalSupply();
        } else {
            return tokenTotalSupply;
        }
    }

    // Sets the Parameters for Token fees. This is all set to zero in the Zamp Token immplementation
    function setParams(uint256 newBasisPoints, uint256 newMaxFee)
        public
        onlyOwner
    {
        // Ensure transparency by hardcoding limit beyond which fees can never be added
        require(newBasisPoints < 20);
        require(newMaxFee < 50);

        basisPointsRate = newBasisPoints;
        maximumFee = newMaxFee.mul(decimalsfactor);

        emit Params(basisPointsRate, maximumFee);
    }
}
