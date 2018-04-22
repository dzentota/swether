pragma solidity 0.4.18;

import "./Pausable.sol";
import "./Util.sol";
import "./SafeMath.sol";
import "./Verifiable.sol";

contract Swether is Pausable, Verifiable {

    uint8 constant public MAX_FEE = 20;

    using SafeMath for uint256;

    mapping (address => uint256) internal channels;

    mapping (bytes32 => address) internal usedVouchers;
    mapping (bytes32 => address) internal claimedVouchers;

    address public signerAddress;

    mapping(address => bool) private validators;

    mapping (bytes32 => uint256) private challengePeriods;

    // Flag to prevent reentrancy attack
    bool private locked = false;

    modifier noReentrancy() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }

    /// @param _signerAddress The address derived from server's private key
    function setSignerAddress(address _signerAddress) external onlyManyOwners {
        signerAddress = _signerAddress;
    }

    function contribute() public payable {
        channels[msg.sender] = msg.value;
    }

    uint8 public fee;

    function setFee(uint8 _fee) external onlyManyOwners {
        require(_fee <= MAX_FEE);
        fee = _fee;
    }


    function Swether(uint8 _fee, address _signerAddress, address[] _validators) Validatable(_validators) public {
        require(_fee <= MAX_FEE);
        require(_signerAddress != address(0));
        fee = _fee;
        signerAddress = _signerAddress;
    }

    function() public payable {
        contribute();
    }

    function withdraw(string _id, uint256 _value, address _channel, uint8 v, bytes32 r, bytes32 s) external noReentrancy whenChannelNotPaused(_channel) whenNotPaused {
        require(checkVoucher(_id, _value, _channel, v, r, s));
        require(channels[_channel] >= _value);
        bytes32 key = getKey(_id);
        require(claimedVouchers[key] == msg.sender);
        require(challengePeriods[key] <= block.number);
        usedVouchers[key] = msg.sender;

        channels[_channel] = channels[_channel].sub(_value);
        msg.sender.transfer(_value);
    }

    function claimExchange(string _id, uint256 _value, address _channel, uint8 v, bytes32 r, bytes32 s) external noReentrancy whenChannelNotPaused(_channel) whenNotPaused{
        require(checkVoucher(_id, _value, _channel, v, r, s));
        require(channels[_channel] >= _value);
        bytes32 key = getKey(_id);
        uint256 challengePeriod = block.number.add(blocksToWait(_value));
        challengePeriods[key] = challengePeriod;
        claimedVouchers[key] = msg.sender;
    }

    function getBalance(address owner) external view returns (uint256) {
        return channels[owner];
    }

    function checkVoucher(string _id, uint256 _value, address _channel, uint8 v, bytes32 r, bytes32 s) private view returns(bool)
    {
        require(!isVoucherUsed(_id));
        return isVoucherSigner(signerAddress, _id, _value, _channel, v, r, s);
    }

    function getKey(string _id) public pure returns (bytes32 data)
    {
        return keccak256(_id);
    }

    function isVoucherUsed(string _id) public view returns (bool) {
        bytes32 key = getKey(_id);
        return usedVouchers[key] != 0;
    }

    function blocksToWait(uint256 _value) internal pure returns(uint8){
        if (_value >= 1 ether) {
            return 2;
        }
        return 0;
    }

}
