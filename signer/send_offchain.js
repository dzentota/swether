//nodejs send_offchain.js encryptedString

var args = process.argv.slice(2);

const EthCrypto = require('eth-crypto');
const contract = require('truffle-contract')
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider)
const uuidv4 = require('uuid/v4');

require('dotenv').config();
const private_key = process.env["SERVER_PRIVATE_KEY"];
//////////////////////////////////////
const encryptedString = args[0];

const encryptedObject = EthCrypto.cipher.parse(encryptedString);

async function decryptWithPrivateKey(private_key, encryptedObject) {
    return await EthCrypto.decryptWithPrivateKey(
        private_key,
        encryptedObject
    )
}

decryptWithPrivateKey(private_key, encryptedObject)
    .then(function (decrypted) {
        const decryptedPayload = JSON.parse(decrypted);

        // check signature
        const senderAddress = EthCrypto.recover(
            decryptedPayload.signature,
            EthCrypto.hash.keccak256(decryptedPayload.message)
        );

        console.log(senderAddress);
        console.log(decryptedPayload.message);
        const voucher = JSON.parse(decryptedPayload.message);
        if (voucher.issuer !== senderAddress) {
            console.log("ERROR: invalid message sender");
            process.exit(1);
        }
        // check on-chain balance
        const SwetherArtifact = require('../build/contracts/Swether');
        const Swether = contract(SwetherArtifact)
        Swether.setProvider(provider)
        Swether.deployed().then(function(_) {
            return _.getBalance.call(voucher.issuer);
        }).then(function (balance) {
            if (balance.valueOf() < voucher.value) {
                console.log("ERROR: on-chain balance is too low. Deposit some ether");
                // process.exit(1);
            }
        });

        const voucherId = uuidv4();
        const newVoucher = {id: voucherId, value: voucher.value, issuer: voucher.issuer, owner:voucher.owner};

        const message = JSON.stringify(newVoucher);
        const signature = EthCrypto.sign(
            private_key,
            EthCrypto.hash.keccak256(message)
        );

        let dirPrefix = voucherId.split('-').join('/');
        console.log(dirPrefix);
    });


// /////////////////////////////////////

///////////////////////////
// const uuidv4 = require('uuid/v4');
//
// const uid  = uuidv4();
// const signHash = EthCrypto.hash.keccak256([
//     { // prefix
//         type: 'string',
//         value: 'Signed for Swether:'
//     },
//     { // id
//         type: 'string',
//         value: uid
//     },
//     { // amount
//         type: 'uint256',
//         value: '5000000000000000'
//     }, { // channel
//         type: 'address',
//         value: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c', //'0xd492556ff984025d7766fd95739af426e0b2a497'
//     }
// ]);
//
// const signature = EthCrypto.sign(
//     private_key,
//     signHash
// );
//
// const vrs = EthCrypto.vrs.fromString(signature);
// console.log(uid);
// console.log(vrs);
