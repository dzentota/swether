var args = process.argv.slice(2);
const EthCrypto = require('eth-crypto');
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider)

require('dotenv').config();
const uuidv4 = require('uuid/v4');

var private_key = process.env["SERVER_PRIVATE_KEY"];

const uid  = uuidv4();
const signHash = EthCrypto.hash.keccak256([
    { // prefix
        type: 'string',
        value: 'Signed for Swether:'
    },
    { // id
        type: 'string',
        value: uid
    },
    { // amount
        type: 'uint256',
        value: '5000000000000000'
    }, { // channel
        type: 'address',
        value: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c', //'0xd492556ff984025d7766fd95739af426e0b2a497'
    }
]);

const signature = EthCrypto.sign(
    private_key,
    signHash
);

const vrs = EthCrypto.vrs.fromString(signature);
console.log(uid);
console.log(vrs);
