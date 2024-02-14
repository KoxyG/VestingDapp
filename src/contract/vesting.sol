// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";



contract tokenContract is ERC20 {
    constructor() ERC20("VToken", "VTK") {
    }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}


contract VestingContract {

    address public admin;
    address public token;
    bool vestingEnded;

    

    enum StakeholderType { None, Founder, Investor, Community, PreSale }

    bool private locked;
    bool isWhitelisted;

    struct VestingSchedule { 
        uint256 amount;
        address beneficiary;
        uint256 vestingDuration;
        string name;
        string description;
        StakeholderType stakeholderType;

    }

    struct HeritedVestingSchedule {
        VestingSchedule baseData;
        bool isWhitelisted;
        bool isClaimed;
    }

    mapping(address => HeritedVestingSchedule) vestingSchedule;
    

    event vestingScheduleCreated(uint256 amount, string name, string description, uint vestingDuration, StakeholderType stakeholderType, address indexed beneficiary);
    event WhitelistedAddress(address indexed beneficiary, bool isWhitelisted);
    event TokensClaimed(address indexed beneficiary, uint256 amount);

    modifier onlyOwner {
        require(msg.sender == admin, "only admin can do this");
        _;
    }




    modifier onlyWhitelisted() {
    HeritedVestingSchedule storage userVesting = vestingSchedule[msg.sender];
    require(userVesting.isWhitelisted, "Not whitelisted");
    _;
}

    modifier noReentrancy() {
        require(!locked, "token is still locked");
        locked = true;
        _;
        locked = false;
    }


    
    constructor(address _token) {
        admin = msg.sender;
        token = _token;
    }


    function createVestingSchedule(uint256 _amount, address _beneficiary, StakeholderType _stakeholderType, uint256 _vestingDuration,  string memory _name, string memory _description) external  {
        require(msg.sender != address(0), "address zero detected");
        require(_vestingDuration > block.timestamp, "Duration should be > the current time");
        require(IERC20(token).balanceOf(msg.sender) >= _amount, "insufficient funds");
        require(_amount > 0, "amount should be greater than zero");
        
        

        IERC20(token).transferFrom(msg.sender, address(this), _amount);

        HeritedVestingSchedule storage userVesting = vestingSchedule[_beneficiary];

        userVesting.baseData.amount = userVesting.baseData.amount + _amount;
        userVesting.baseData.name = _name;
        userVesting.baseData.description = _description;
        userVesting.baseData.vestingDuration = _vestingDuration;
        userVesting.baseData.stakeholderType = _stakeholderType;
        userVesting.baseData.beneficiary = _beneficiary;

        admin = msg.sender;


        emit vestingScheduleCreated(_amount, _name, _description, _vestingDuration, _stakeholderType, _beneficiary);
    }

    function getVestingSchedule(address _address) external view returns (HeritedVestingSchedule memory) {
       return vestingSchedule[_address];
    }

    function whitelistAddress(address _beneficiary) external onlyOwner {
        HeritedVestingSchedule storage userVesting = vestingSchedule[_beneficiary];

        require(_beneficiary == userVesting.baseData.beneficiary, "User hasn't been vested.");
        require(!userVesting.isWhitelisted, "Address is already whitelisted");

        userVesting.isWhitelisted = true;

        emit WhitelistedAddress(_beneficiary, true);
    }

    function getWhiteListedAddress(address _beneficiary) external view returns(bool) {
        return vestingSchedule[_beneficiary].isWhitelisted;
    }

    // Admin cannot claim
    function claimTokens() external noReentrancy  onlyWhitelisted {
        HeritedVestingSchedule storage userVesting = vestingSchedule[msg.sender];
        
        require(userVesting.baseData.vestingDuration <= block.timestamp, "tokens are still being vested");
        require(!userVesting.isClaimed, "Tokens has already been claimed" );
        
        IERC20(token).transfer(msg.sender, userVesting.baseData.amount);

        userVesting.isClaimed = true;
        emit TokensClaimed(msg.sender, userVesting.baseData.amount);

       
    }

    function getStakeholderType(address _address) external view returns (StakeholderType) {
        HeritedVestingSchedule storage userVesting = vestingSchedule[_address];
        return userVesting.baseData.stakeholderType;
    }


    function contractBalance() external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(amount <= IERC20(token).balanceOf(address(this)), "Not enough tokens in the contract");
        IERC20(token).transfer(admin, amount);
    }


}