var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
const path = require('path');
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:9545')
const web3 = new Web3(provider)

const EthCrypto = require('eth-crypto');
const contract = require('truffle-contract')
const uuidv4 = require('uuid/v4');

require('dotenv').config();
const private_key = process.env["SERVER_PRIVATE_KEY"];


app.listen(8080);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('balance_request', function (data) {
        const accountFile = path.join(__dirname, 'accounts', data);
        console.log(accountFile);
        if (!fs.existsSync(accountFile)) {
            fs.writeFileSync(accountFile, 0);
        }
        const balance = fs.readFileSync(accountFile,"utf8");
        console.log(balance);

        web3.eth.coinbase = data;
        web3.eth.defaultAccount = data;

        web3.eth.getBalance(data, function (error, result) {
            if (!error) {
                console.log(data + ': ' + result);
                socket.emit('balance_update', { address: data, swether:balance, ether: result});
            } else {
                console.log(error);
                socket.emit('balance_update', { address: data, swether:balance, ether: 0});
            }
        });
    });

    socket.on('issue_voucher', function (encryptedString) {
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
                newVoucher.signature = signature;
                // path.join(__dirname, 'vouchers', dirPrefix)
                const fullPath = path.join(__dirname, 'vouchers', dirPrefix);
                var shell = require('shelljs');
                shell.mkdir('-p', fullPath);
                fs.writeFileSync(path.join(fullPath, voucherId), JSON.stringify(newVoucher));

                if (shell.exec('git add .').code !== 0) {
                    shell.echo('Error: Git "add" failed');
                    shell.exit(1);
                }
                if (shell.exec('git commit -m "commit new voucher"').code !== 0) {
                    shell.echo('Error: Git commit failed');
                    shell.exit(1);
                }
                if (shell.exec('git push origin HEAD').code !== 0) {
                    shell.echo('Error: Git push failed');
                    shell.exit(1);
                }
            });
    })
});
