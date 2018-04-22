import EthCrypto from 'eth-crypto';

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
        document.getElementById('balance').innerHTML = data.balance;
    }
});

function createNewIdentity()
{
    return EthCrypto.createIdentity();
}
