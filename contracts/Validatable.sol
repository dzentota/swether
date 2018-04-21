pragma solidity 0.4.18;

import "./Multiownable.sol";


contract Validatable is Multiownable {

    uint256 public validatorsGeneration;
    uint256 public howManyValidatorsDecide;
    address[] public validators;
    bytes32[] public allValidatorsOperations;
    address internal insideOnlyManyValidators;

    // Reverse lookup tables for validators and allValidatorsOperations
    mapping(address => uint) validatorsIndices; // Starts from 1
    mapping(bytes32 => uint) allValidatorsOperationsIndicies;

    // Validators voting mask per operations
    mapping(bytes32 => uint256) public votesMaskByValidatorOperation;
    mapping(bytes32 => uint256) public votesCountByValidatorOperation;

    // EVENTS

    event ValidatorRightsTransferred(address[] previousValidators, address[] newValidators);

    // ACCESSORS

    function isValidator(address wallet) public constant returns(bool) {
        return validatorsIndices[wallet] > 0;
    }

    function validatorsCount() public constant returns(uint) {
        return validators.length;
    }

    function allValidatorsOperationsCount() public constant returns(uint) {
        return allValidatorsOperations.length;
    }

    // MODIFIERS

    /**
    * @dev Allows to perform method by any of the validators
    */
    modifier onlyAnyValidator {
        require(isValidator(msg.sender));
        _;
    }

    /**
    * @dev Allows to perform method only after all Validators call it with the same arguments
    */
    modifier onlyManyValidators {
        if (insideOnlyManyValidators == msg.sender) {
            _;
            return;
        }
        require(isValidator(msg.sender));

        uint validatorIndex = validatorsIndices[msg.sender] - 1;
        bytes32 operation = keccak256(msg.data, validatorsGeneration);

        if (votesMaskByValidatorOperation[operation] == 0) {
            allValidatorsOperationsIndicies[operation] = allOperations.length;
            allValidatorsOperations.push(operation);
        }
        require((votesMaskByValidatorOperation[operation] & (2 ** validatorIndex)) == 0);
        votesMaskByValidatorOperation[operation] |= (2 ** validatorIndex);
        votesCountByValidatorOperation[operation] += 1;

        // If all validators confirm same operation
        if (votesCountByValidatorOperation[operation] == howManyValidatorsDecide) {
            deleteValidatorOperation(operation);
            insideOnlyManyValidators = msg.sender;
            _;
            insideOnlyManyValidators = address(0);
        }
    }

    // CONSTRUCTOR

    function Validatable(address[] _validators) public {
        transferValidatorRights(_validators);
    }

    // INTERNAL METHODS

    /**
    * @dev Used to delete cancelled or performed operation
    * @param operation defines which operation to delete
    */
    function deleteValidatorOperation(bytes32 operation) internal {
        uint index = allValidatorsOperationsIndicies[operation];
        if (index < allValidatorsOperations.length - 1) {
            allValidatorsOperations[index] = allValidatorsOperations[allValidatorsOperations.length - 1];
            allValidatorsOperationsIndicies[allValidatorsOperations[index]] = index;
        }
        allValidatorsOperations.length--;

        delete votesMaskByValidatorOperation[operation];
        delete votesCountByValidatorOperation[operation];
        delete allValidatorsOperationsIndicies[operation];
    }

    // PUBLIC METHODS

    /**
    * @dev Allows owners to change Validators
    * @param newValidators defines array of addresses of new Validators
    */
    function transferValidatorRights(address[] newValidators) public {
        transferValidatorRightsWithHowMany(newValidators, newValidators.length);
    }

    /**
    * @dev Allows owners to change validators
    * @param newValidators defines array of addresses of new validators
    * @param newHowManyValidatorsDecide defines how many validators can decide
    */
    function transferValidatorRightsWithHowMany(address[] newValidators, uint256 newHowManyValidatorsDecide) public onlyManyOwners {
        require(newValidators.length > 0);
        require(newValidators.length <= 256);
        require(newHowManyValidatorsDecide > 0);
        require(newHowManyValidatorsDecide <= newValidators.length);
        for (uint i = 0; i < newValidators.length; i++) {
            require(newValidators[i] != address(0));
        }

        ValidatorRightsTransferred(validators, newValidators);

        // Reset validators array and index reverse lookup table
        for (i = 0; i < validators.length; i++) {
            delete validatorsIndices[validators[i]];
        }
        for (i = 0; i < newValidators.length; i++) {
            require(validatorsIndices[newValidators[i]] == 0);
            validatorsIndices[newValidators[i]] = i + 1;
        }
        validators = newValidators;
        howManyValidatorsDecide = newHowManyValidatorsDecide;
        allValidatorsOperations.length = 0;
        validatorsGeneration++;
    }


}