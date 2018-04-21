pragma solidity 0.4.18;


contract Verifier {

    /**
     * to ensure the signatures for this contract cannot be
     * replayed somewhere else, we add this prefix to the signed hash
     */
    string public signPrefix = "Signed for DonationBag:";

    /**
     * generates a prefixed hash of the address
     * We hash the following together:
     * - signPrefix
     * - address of this contract
     * - the recievers-address
     */
    function prefixedHash(
    address receiver
    ) public constant returns(bytes32) {
        bytes32 hash = keccak256(
        signPrefix,
        address(this),
        receiver
        );
        return hash;
    }

    /**
     * validates if the signature is valid
     * by checking if the correct message was signed
     */
    function getSigner(
    address receiver,
    uint8 v,
    bytes32 r,
    bytes32 s
    ) public constant returns (address) {
        bytes32 mustBeSigned = prefixedHash(receiver);
        address signer = ecrecover(
        mustBeSigned,
        v, r, s
        );

        return signer;
    }

    function recoverAddr(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        return ecrecover(msgHash, v, r, s);
    }

    function isSigned(address _addr, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (bool) {
        return ecrecover(msgHash, v, r, s) == _addr;
    }

    function check(string _id, uint256 _value, address _channel, bytes32 paramsHash, uint8 v, bytes32 r, bytes32 s) public pure returns(address) {
        bytes32 msgHash = getHash(_id, _value, _channel);
        bytes32 prefixedHash = getPrefixedHash(msgHash);
        require(prefixedHash == paramsHash);
        return ecrecover(prefixedHash, v, r, s);
    }

    function getHash(string _id, uint256 _value, address _channel) public pure returns (bytes32) {
        bytes32 msgHash = keccak256(
        keccak256(
        'string voucher_id',
        'uint value',
        'address channel'
        ),
        keccak256(
        _id,
        _value,
        _channel
        )
        );
        return msgHash;
    }

    function getSha(string _id, uint256 _value, address _channel) returns (bytes32){
        return keccak256(_id,
    _value,
    _channel);
    }

    function getPrefixedHash(bytes32 msgHash) public pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return  keccak256(prefix, msgHash);
    }
}