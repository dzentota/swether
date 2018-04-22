var Verifiable = artifacts.require("./Verifiable.sol");

module.exports = function(deployer) {
    deployer.deploy(Verifiable);
};
