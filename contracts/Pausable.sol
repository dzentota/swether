pragma solidity 0.4.18;


import "./Validatable.sol";

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Validatable {
    event Pause();
    event Unpause();

    event ChannelPaused(address indexed channel);
    event ChannelUnpaused(address indexed channel);

    bool public paused = false;

    mapping (address => bool) public pausedChannels;

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(paused);
        _;
    }

    modifier whenChannelPaused(address _channel) {
        require(pausedChannels[_channel]);
        _;
    }

    modifier whenChannelNotPaused(address _channel) {
        require(!pausedChannels[_channel]);
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() onlyManyOwners whenNotPaused public {
        paused = true;
        Pause();
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() onlyManyOwners whenPaused public {
        paused = false;
        Unpause();
    }

    function pauseChannel(address _channel) onlyManyValidators whenChannelNotPaused(_channel) whenNotPaused public {
        pausedChannels[_channel] = true;
        ChannelPaused(_channel);
    }

    function unpauseChannel(address _channel) onlyManyValidators whenChannelPaused(_channel) whenNotPaused public {
        pausedChannels[_channel] = false;
        ChannelUnpaused(_channel);
    }
}