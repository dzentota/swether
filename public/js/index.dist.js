import EthCrypto from 'eth-crypto';
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider)

var socket = io('http://swether.dev:8080');
socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});
socket.on('transaction', function (data) {
    console.log(data);
});
var myAddress = localStorage.getItem('swether_address');
if (myAddress == null) {
    let myIdentity = createNewIdentity();
    localStorage.setItem('swether_address', myIdentity.address);
    localStorage.setItem('swether_private_key', myIdentity.privateKey);
    localStorage.setItem('swether_public_key', myIdentity.publicKey);
    myAddress = myIdentity.address;
    console.log("new identity", myIdentity);
} else {
    console.log("address already exixsts", myAddress);
}
document.getElementById('wallet').innerHTML = myAddress;
socket.emit('balance_request', myAddress);
socket.on('balance_update',function (data) {
    console.log(data);
    if (data.address == myAddress) {
        document.getElementById('swether').innerHTML = data.swether;
        document.getElementById('ether').innerHTML = data.ether;
    }
});

function createNewIdentity()
{
    return EthCrypto.createIdentity();
}

function deposit() {
    const amount = jQuery('#depositAmount').val();
    const fromAddress = localStorage.getItem('swether_address');
    const privateKey = localStorage.getItem('swether_private_key');
    const rawTx = {
        from: fromAddress,
        to: "0x7001ea1ca8c28aa90a0d2e8b034aa56319ff0a7e",
        // nonce: 1, // increased by one
        value: parseInt(amount),
        gas: 600000,
        gasPrice: 20000000000
    };
    const serializedTx = EthCrypto.signTransaction(
        rawTx,
        privateKey
    );

    //var serializedTx = tx.serialize();

//console.log(serializedTx.toString('hex'));
//f889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        console.log(hash);
        web3.eth.getBalance(fromAddress, function (error, result) {
            if (!error) {
                console.log(fromAddress + ': ' + result);
                document.getElementById('ether').innerHTML = result;
                // issueVoucher();
            } else {
                console.log(error);
                document.getElementById('ether').innerHTML = '?';
            }
        });
    });

}

function issueVoucher(amount, issuerAddress) {
    const voucher = {value: amount, issuer: issuerAddress, owner:issuerAddress};
    const message = JSON.stringify(voucher);
    const signature = EthCrypto.sign(
        localStorage.getItem('swether_private_key'),
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

    encryptWithPublicKey(payload).then(function (encrypted) {
        console.log(EthCrypto.cipher.stringify(encrypted));
        socket.emit('issue_voucher', encrypted);
    });

}

function transfer() {
    
}

function withdraw() {
    
}

jQuery(function () {
    $('#btnDeposit').on('click', deposit);
})