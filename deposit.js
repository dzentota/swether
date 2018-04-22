var args = process.argv.slice(2);

const amount = args[0];

const EthCrypto = require('eth-crypto');
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider)

require('dotenv').config();

const alice = EthCrypto.createIdentity();

const signature = EthCrypto.sign(
    alice.privateKey,
    EthCrypto.hash.keccak256(amount)
);
const payload = {
    message: amount,
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
//
// we convert the object into a smaller string-representation
// const encryptedString = EthCrypto.cipher.stringify(encrypted);
// console.log(alice.address);
// console.log(encryptedString);