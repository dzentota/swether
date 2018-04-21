// Allows us to use ES6 in our migrations and tests.
require('dotenv').config();
require('babel-register');
require('babel-polyfill');

const Web3 = require("web3");
const web3 = new Web3();

var main_net_mnemonic = process.env["MAIN_NET_MNEMONIC"];
var test_net_mnemonic = process.env["TEST_NET_MNEMONIC"];
var infura_apikey = process.env["INFURA_API_KEY"];

var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // for more about customizing your Truffle configuration!
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(test_net_mnemonic, "https://ropsten.infura.io/" + infura_apikey)
            },
            network_id: 3
        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(test_net_mnemonic, "https://rinkeby.infura.io/" + infura_apikey)
            },
            network_id: '4'
        },
        coverage: {
            host: 'localhost',
            network_id: '*', // eslint-disable-line camelcase
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01,
        },
        testrpc: {
            host: 'localhost',
            port: 8545,
            network_id: '*', // eslint-disable-line camelcase
        },
        ganache: {
            host: 'localhost',
            port: 7545,
            network_id: '*', // eslint-disable-line camelcase
        },
        mainnet: {
            provider: function() {
                return new HDWalletProvider(main_net_mnemonic, "https://mainnet.infura.io/" + infura_apikey)
            },
            gas: 4600000,
            gasPrice: web3.toWei("20", "gwei"),
            network_id: "1", // eslint-disable-line camelcase
        }
    }
};
