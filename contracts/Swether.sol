pragma solidity 0.4.18;

import "./Multiownable.sol";

contract Swether is Pausable {

    uint8 constant public MAX_FEE = 20;

    using SafeMath for uint256;

    mapping (address => uint256) internal balances;

    mapping (bytes32 => address) internal usedVouchers;

    address public signerAddress;

    address public signerAddress;

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
        balances[msg.sender] = msg.value;
    }

    uint8 fee public;

    function Swether(uint8 _fee) public {
        require(fee <= MAX_FEE);
    }

    function() public payable {
        contribute();
    }

    function settle(string _id, uint256 _value, address _channelOwner, bytes _msg_sig) external noReentrancy {
        require(checkVoucher(_id, _value, _msg_sig));
        bytes32 key = getKey(_id, _value);
        usedVouchers[key] = msg.sender;
        require(balances[_channelOwner] >= _value);
        balances[_channelOwner] = balances[_channelOwner].sub(_value);
        msg.sender.transfer(_value);
    }

    function getBalance(address owner) external view returns (uint256) {
        return balances[owner];
    }

    function checkVoucher(string _id, uint256 _value, bytes _msg_sig) private returns(bool)
    {
        return true;
    }

    function getKey(string _id, address _owner) public pure returns (bytes32 data)
    {
        return keccak256(_id, _owner);
    }
}
