pragma solidity 0.4.21;

import "./Pausable.sol";
import "./Util.sol";
import "./ECVerify.sol";

contract Swether is Pausable {

    uint8 constant public MAX_FEE = 20;

    using SafeMath for uint256;

    mapping (address => uint256) internal channels;

    mapping (bytes32 => address) internal usedVouchers;

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

    function contribute() external payable {
        channels[msg.sender] = msg.value;
    }

    uint8 fee public;

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

    function withdraw(string _id, uint256 _value, address _channel, bytes _msg_sig) external noReentrancy whenChannelNotPaused(_channel) whenNotPaused {
        require(checkVoucher(_id, _value, _msg_sig));
        require(channels[_channel] >= _value);
        bytes32 key = getKey(_id);
        require(challengePeriods[key] >= block.number);
        usedVouchers[key] = msg.sender;

        channels[_channel] = channels[_channel].sub(_value);
        msg.sender.transfer(_value);
    }

    function claimExchange(string _id, uint256 _value, address _channel, bytes _msg_sig) external noReentrancy whenChannelNotPaused(_channel) whenNotPaused{
        require(checkVoucher(_id, _value, _channel, _msg_sig));
        require(channels[_channel] >= _value);
        bytes32 key = getKey(_id);
        uint256 challengePeriod = block.number.add(blocksToWait(_value));
        challengePeriods[key] = challengePeriod;
    }

    function getBalance(address owner) external view returns (uint256) {
        return channels[owner];
    }

    function checkVoucher(string _id, uint256 _value, _address _channel, bytes _msg_sig) private returns(bool)
    {
        require(!isVoucherUsed(_id));
        bytes32 message_hash = keccak256(
            keccak256(
            'string voucher_id',
            'uint value'
            'address channel',
            ),
            keccak256(
            _id,
            _value,
            _channel
            )
        );
        // Derive address from signature
        address signer = ECVerify.ecverify(message_hash, _msg_sig);
        return signerAddress == signer;
//        return true;
    }

    function getKey(string _id) public pure returns (bytes32 data)
    {
        return keccak256(_id);
    }

    function isVoucherUsed(string _id) public view returns (bool) {
        bytes32 key = getKey(_id);
        return usedVouchers[key];
    }

    function blocksToWait(uint256 _value) internal pure {
        return 2;
    }

}
