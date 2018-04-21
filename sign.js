const contract = require('truffle-contract')
const leftPad = require('left-pad')
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider)

// const bytes32Id = web3.sha3('123-24444-232-33');
//
// console.log(web3.sha3(
//     '123-24444-232-33',
//     10000000000000000,
//     "0x627306090abab3a6e1400e9345bc60c78a8bef57"
// ));

function keccak256(...args) {
    args = args.map(arg => {
        if (typeof arg === 'string') {
            if (arg.substring(0, 2) === '0x') {
                return arg.slice(2)
            } else {
                return web3.toHex(arg).slice(2)
            }
        }

        if (typeof arg === 'number') {
            return leftPad((arg).toString(16), 64, 0)
        } else {
            return ''
        }
    })

    args = args.join('')

    return web3.sha3(args, { encoding: 'hex' })
}
// console.log(keccak256(
//     '123-24444-232-33',
//     10000000000000000,
//     "0x627306090abab3a6e1400e9345bc60c78a8bef57"
// ));

const message_hash = web3.sha3(
    web3.sha3(
        'string voucher_id',
        'uint value',
        'address channel'
    ),
    web3.sha3(
        '123-24444-232-33',
        10000000000000000,
        "0x627306090abab3a6e1400e9345bc60c78a8bef57"
    )
);
console.log(`message_hash ----> ${message_hash}`);
const message_hash_keccak = keccak256(
    keccak256(
        'string voucher_id',
        'uint value',
        'address channel'
    ),
    keccak256(
        '123-24444-232-33',
        10000000000000000,
        "0x627306090abab3a6e1400e9345bc60c78a8bef57"
    )
);
console.log(`message_hash_keccak ----> ${message_hash_keccak}`);

const VerifierArtifact = require('./build/contracts/Verifier')
const Verifier = contract(VerifierArtifact)
Verifier.setProvider(provider)

function toHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

const addr = web3.eth.accounts[0]
const msg = message_hash_keccak;//'0xca35b7d915458ef540ade6068dfe2f44e8fa733c';//'school bus'
const hex_msg = '0x' + toHex(msg)
let signature = web3.eth.sign(addr, hex_msg);
// let signature = web3.eth.sign(addr, message_hash);
//console.log(signature);
//
console.log(`address -----> ${addr}`)
// console.log(`msg ---------> ${msg}`)
// console.log(`hex(msg) ----> ${hex_msg}`)
console.log(`sig ---------> ${signature}`)
//
signature = signature.substr(2);
const r = '0x' + signature.slice(0, 64);
const s = '0x' + signature.slice(64, 128);
const v = '0x' + signature.slice(128, 130);
const v_decimal = web3.toDecimal(v) + 27;
//
//
console.log(`r -----------> ${r}`)
console.log(`s -----------> ${s}`)
console.log(`v -----------> ${v}`)
console.log(`vd ----------> ${v_decimal}`)


Verifier
    .deployed()
    .then(instance => {
        // const msg = message_hash;
    const fixed_msg = `\x19Ethereum Signed Message:\n${msg.length}${msg}`
    const fixed_msg_sha = web3.sha3(fixed_msg)
    // console.log(`"${msg}","${fixed_msg_sha}",${v_decimal},"${r}","${s}"`)
return instance.recoverAddr.call(
    fixed_msg_sha,
    v_decimal,
    r,
    s
)
//         return instance.recoverAddr.call(message_hash, v_decimal, r, s);
})
.then(data => {
    console.log('-----data------')
console.log(`input addr ==> ${addr}`)
console.log(`output addr => ${data}`)
})
.catch(e => {
    console.log('i got an error')
console.log(e)
})


Verifier
    .deployed()
    .then(instance => {
        // check(string _id, uint256 _value, address _channel, uint8 v, bytes32 r, bytes32 s)
        const fixed_msg = `\x19Ethereum Signed Message:\n${msg.length}${msg}`
        const fixed_msg_sha = web3.sha3(fixed_msg)
        console.log(`msg ==> "${msg}", fixed_msg_sha ==> "${fixed_msg_sha}"`)
        return instance.check.call(
            '123-24444-232-33',
            10000000000000000,
            "0x627306090abab3a6e1400e9345bc60c78a8bef57",
            fixed_msg_sha,
            v_decimal,
            r,
            s
        )
//         return instance.recoverAddr.call(message_hash, v_decimal, r, s);
    })
    .then(data => {
        console.log('-----check------')
        console.log(`input addr ==> ${addr}`)
        console.log(`output addr => ${data}`)
    })
    .catch(e => {
        console.log('i got an error')
        console.log(e)
    })
