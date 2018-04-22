var args = process.argv.slice(2);

const amount = args[0];

const contract = require('truffle-contract')
const EthCrypto = require('eth-crypto');
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider);
const uuidv4 = require('uuid/v4');
require('dotenv').config();

const alice = EthCrypto.createIdentity();

/////////////////////////////////////
const SwetherArtifact = require('./build/contracts/Swether');
const Swether = contract(SwetherArtifact)
Swether.setProvider(provider)
Swether.deployed().then(function(_) {
   return _.getBalance.call(alice.address);
}).then(function (balance) {
    if (balance.valueOf() < amount) {
        console.log("ERROR: on-chain balance is too low. Deposit some ether");
        process.exit(1);
    }
});

////////////////////////////////////

const voucher = {value: amount, issuer: alice.address, owner:alice.address};
const message = JSON.stringify(voucher);
const signature = EthCrypto.sign(
    alice.privateKey,
    EthCrypto.hash.keccak256(message)
);
const payload = {
    message: message,
    signature
};

async function encryptWithPublicKey(payload) {
    return await EthCrypto.encryptWithPublicKey(
        process.env["SERVER_PUBLIC_KEY"], // by encryping with server publicKey, only server can decrypt the payload with his privateKey
        JSON.stringify(payload) // we have to stringify the payload before we can encrypt it
    );
}

console.log(alice.address);
encryptWithPublicKey(payload).then(function (encrypted) {
    console.log(EthCrypto.cipher.stringify(encrypted));
});
