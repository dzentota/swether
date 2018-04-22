const EthCrypto = require('eth-crypto');
const publicKey = EthCrypto.publicKeyByPrivateKey(
    '01798f12a5615e2aab5b6b4c09794d9422291492d0d5b49a9e901d5a6adcb723'
);
const compressed = EthCrypto.publicKey.compress(
    publicKey
);
console.log(publicKey);
console.log(compressed);