const contract = require('truffle-contract')
const EthCrypto = require('eth-crypto');
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider)

const VerifierArtifact = require('./build/contracts/Verifiable')
const Verifier = contract(VerifierArtifact)
Verifier.setProvider(provider)


const creatorIdentity = EthCrypto.createIdentity();
const recieverIdentity = EthCrypto.createIdentity();

Verifier
    .deployed()
    .then(instance => {
        const signHash = EthCrypto.hash.keccak256([
            { // prefix
                type: 'string',
                value: 'Signed for Swether:'
            },
            { // id
                type: 'string',
                value: '123-24444-232-33'
            },
            { // amount
                type: 'uint256',
                value: '10000000000000000'
            }, { // channel
                type: 'address',
                value: '0x627306090abab3a6e1400e9345bc60c78a8bef57'
            }
        ]);

        const signature = EthCrypto.sign(
            creatorIdentity.privateKey,
            signHash
        );

        const vrs = EthCrypto.vrs.fromString(signature);

        console.log(vrs);

        return instance.getVoucherSigner.call(
            '123-24444-232-33',
            '10000000000000000',
            '0x627306090abab3a6e1400e9345bc60c78a8bef57',
            vrs.v,
            vrs.r,
            vrs.s
        )
//         return instance.recoverAddr.call(message_hash, v_decimal, r, s);
    })
    .then(data => {
        let addr = creatorIdentity.address;
        console.log('-----data------')
        console.log(`input addr ==> ${addr}`)
        console.log(`output addr => ${data}`)
    })
    .catch(e => {
        console.log('i got an error')
        console.log(e)
    })


// const signature2 = web3.eth.sign(creatorIdentity.address, signHash);
//
// console.log(signature2);






