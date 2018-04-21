var SafeMath = artifacts.require("./SafeMath.sol");
var Swether = artifacts.require("./Swether.sol");

const settings = {
    fee: 5,
    signer: "0x0253FA2d248eE1069e8c98166CD1505064f01761",
    validators: ["0xD492556ff984025D7766FD95739af426e0B2A497"]
};

module.exports = function(deployer) {
    deployer.deploy(SafeMath, {overwrite: false});
    deployer.link(SafeMath, Swether);
    deployer.deploy(Swether, ...Object.values(settings));
};

