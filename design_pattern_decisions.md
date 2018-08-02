# Consensys Academy 2018 - Design Pattern Decisions

## Fail early and fail loud

Functions check conditions as early as possible, e.g. using require() and throw exceptions if condition not met. Reduces unnecessary code execution in event an exception will be thrown.

## State Machine

The ItemStorage contract acts as a state machine with calling functions depending on an Item being isAnswered, isCancelled and isBountyCollected.

Function modifiers are used to guard against incorrect usage. For example a bounty can't be collected unless the item isAnswered == true.

## Withdrawal from Contracts
The recommended method of sending funds after an effect is using the withdrawal pattern. Although the most intuitive method of sending Ether, as a result of an effect, is a direct send call, this is not recommended as it introduces a potential security risk. In this project if your answer is accepted you can then claim the bounty using the claimBounty function.

## Mortal/Kill

Used to destroy a contract using the destroyAndSend function from the OpenZeppelin Destructible library. It takes one parameter which is the address that will receive all of the funds that the contract currently holds.

## Circuit Breaker

Stops contract functionality. i.e. if a bug was found but can still allow certain function to continue. In my case I thought it would be good for storage to have a circuit breaker that stops any creation of new items/answers but still allows item owners to cancel and refund their bounties. Implemented based on: https://github.com/cjgdev/smart-contract-patterns/blob/master/security/circuit_breaker.sol

## Restricting Access

Keeping public variables/functions to only those that require it. Also using function modifiers to manage function restrictions and make them more readable.

Using Ownable OpenZeppelin library also limits access to certain function to only the owner of the contract.


## Upgradeability

The contracts are designed to separate the data and logic. The Parent contract is responsible for managing Item contracts which are upgradeable and use permanent storage from ItemStorage contract. This allows the functionality to be upgraded without the expenses of also having to redeploy storage. Basically the storage is permanent and new contracts point to it. An Item interface is used to decouple inter-contract communication and avoid the Parent having to be redeployed every time we upgrade.

The following posts describe the pattern in more detail.


https://blog.colony.io/writing-upgradeable-contracts-in-solidity-6743f0eecc88


https://medium.com/@nrchandan/interfaces-make-your-solidity-contracts-upgradeable-74cd1646a717
