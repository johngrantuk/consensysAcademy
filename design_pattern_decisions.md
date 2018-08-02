# Consensys Academy 2018 - Design Pattern Decisions

## Fail early and fail loud

Functions check conditions as early as possible, e.g. using require() and throw exceptions if condition not met. Reduces unnecessary code execution in event an exception will be thrown.

## State Machine

My contract acts as a state machine with calling functions depending on an Item being isAnswered, isCancelled and isBountyCollected.

Function modifiers are used to guard against incorrect usage. For example a bounty can't be collected unless the item isAnswered == true.

## Withdrawal from Contracts
The recommended method of sending funds after an effect is using the withdrawal pattern. Although the most intuitive method of sending Ether, as a result of an effect, is a direct send call, this is not recommended as it introduces a potential security risk. In this project if your answer is accepted you can then claim the bounty using the claimBounty function.

## Mortal/Kill

Used to destroy a contract using the destroyAndSend function from the OpenZeppelin Destructible library. It takes one parameter which is the address that will receive all of the funds that the contract currently holds.

## Circuit Breaker

Stops contract functionality. i.e. if a bug was found but can still allow certain function to continue. In my case I thought it would be good for storage to have a circuit breaker that stops any creation of new items/answers but still allows item owners to cancel and refund their bounties. Implemented based on: https://github.com/cjgdev/smart-contract-patterns/blob/master/security/circuit_breaker.sol




## Admin class

Helps to restrict access to functions for specific tasks.




Restricting Access
Restricting access is a common pattern for contracts. Note that you can never restrict any human or computer from reading the content of your transactions or your contract’s state. You can make it a bit harder by using encryption, but if your contract is supposed to read the data, so will everyone else.

You can restrict read access to your contract’s state by other contracts. That is actually the default unless you declare make your state variables public.

Furthermore, you can restrict who can make modifications to your contract’s state or call your contract’s functions and this is what this section is about.

The use of function modifiers makes these restrictions highly readable.

Ownership
owner - Limits access to certain functions to only the owner of the contract. ownership/owner.sol

Security
circuit_breaker - The circuit breaker pattern allows the owner to disable or enable a contract by a runtime toggle. security/circuit_breaker.sol

rejector - The rejector pattern automatically rejects all ether sent to it. security/rejector.sol

speed_bump - The speed bump pattern limits how often a function can be called to deliberately slow down certain functions. security/speed_bump.sol

## Upgradeability

Seperate data and logic
The contract can be updated by pointing users to use the new logic contract (through a resolver such as ENS) and updating the data contract permissions to allow the new logic contract to be able to execute the setters.

https://blog.colony.io/writing-upgradeable-contracts-in-solidity-6743f0eecc88
https://consensys.github.io/smart-contract-best-practices/software_engineering/
https://medium.com/aigang-network/upgradable-smart-contracts-what-weve-learned-at-aigang-b181d3d4b668
https://blog.indorse.io/ethereum-upgradeable-smart-contract-strategies-456350d0557c
https://medium.com/@nrchandan/interfaces-make-your-solidity-contracts-upgradeable-74cd1646a717
