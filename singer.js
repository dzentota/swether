const contract = require('truffle-contract')
const EthCrypto = require('eth-crypto');
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider)

const VerifierArtifact = require('./build/contracts/Verifier')
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
                value: 'Signed for DonationBag:'
            }, { // contractAddress
                type: 'address',
                value: instance.address
            }, { // receiverAddress
                type: 'address',
                value: recieverIdentity.address
            }
        ]);

        const signature = EthCrypto.sign(
            creatorIdentity.privateKey,
            signHash
        );

        const vrs = EthCrypto.vrs.fromString(signature);

        console.log(vrs);

        return instance.getSigner.call(
            recieverIdentity.address,
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






