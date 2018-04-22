pragma solidity 0.4.18;


contract Verifiable {

    /**
     * to ensure the signatures for this contract cannot be
     * replayed somewhere else, we add this prefix to the signed hash
     */
    string public signPrefix = "Signed for Swether:";

    function prefixedParamsHash(
        string _id, uint256 _value, address _channel
    ) public constant returns(bytes32) {
        bytes32 hash = keccak256(
            signPrefix,
            _id,
            _value,
            _channel
        );
        return hash;
    }


    function getVoucherSigner(string _id, uint256 _value, address _channel, uint8 v, bytes32 r, bytes32 s) public constant returns(address)
    {
        bytes32 mustBeSigned = prefixedParamsHash(_id, _value, _channel);
        address signer = ecrecover(
            mustBeSigned,
            v, r, s
        );

        return signer;
    }

    function isVoucherSigner(address signerAddress, string _id, uint256 _value, address _channel, uint8 v, bytes32 r, bytes32 s) public constant returns(bool)
    {
        address signer = getVoucherSigner(_id, _value, _channel, v, r, s);
        return signer == signerAddress;
    }
}
