# Consensys Academy 2018 - Measures taken to avoid common attacks

## Integer Overflow and Underflow

When max or min values are hit for integers the value wraps we have to be extra careful with smaller data types like uint8, uint16, etc, they can more easily reach their maximum value.

Mitigated against this risk by:
Using the OpenZeppelin SafeMath library which has math operations with safety checks that throw on error.

##  Race Condition - Reentrancy

Calling external contract means it takes over control and in this case can call functions that could be called repeatedly before the first invocation of the function was finished.

Mitigated against this risk by:
Where external calls can't be avoided then internal work is done before the call.

##  Race Condition - Cross function

An external contract could call another function while executing original.

Mitigated against this risk by: Similar to above where external calls can't be avoided then internal work is done before the call.

## DoS with (Unexpected) revert

Passing execution to another contract that always reverts makes original function unusable.

Mitigated against this risk by: The recommendation is to use pull payments system which is implemented in this project. Also avoided looping behaviour where e.g. a function costs more and more gas each time is used.

## Logic Bugs

Simple programming mistakes can cause the contract to behave differently to its stated rules, especially on 'edge cases'.

Mitigated against this risk by:

Running over 60 functional tests against the contracts - run 'truffle tests' to view.

Following Solidity coding standards and general coding best practices for safety-critical software.

## Exposed Functions
It is easy to accidentally expose a contract function which was meant to be internal, or to omit protection on a function which was meant to be called only by priviledged accounts (e.g. by the creator).

Mitigated against this risk by: Checking the contacts/json ABI files to ensure no unexpected functions appear.
Checking every external function to ensure it is intended to be exposed and has suitable protection.

## Exposed Secrets
All code and data on the blockchain is visible by anyone, even if not marked as "public" in Solidity.

Mitigated against this risk by: Ensuring contracts do not rely on any secret information.

## Tx.Origin Problem
This is kind of a "confused depty" problem. If a contract relies on Solidity 'tx.origin' to decide who the caller is (e.g. to see if they're allowed to withdraw their funds), there's a danger that a malicious intermediary contract could make calls to the contract on behalf of the user (who presumably thought the malicious intermediary contract would do something else). See vessenes.com - Tx.Origin And Ethereum Oh My! for a better description.

Mitigated against this risk by: Not using tx.origin for at all.

## Transaction ordering

Miners choose order to include transactions from mempool in their block. Anyone can know what transaction are about to occur by viewing mempool.

Mitigated against this risk by: This isn't an issue for this project but can be important to bear in mind for things like decentralised exchanges where batch submitting might be a good solution.

## Timestamp Dependence
Timestamps of blocks can be manipulated by the miner. 

Mitigated against this risk by: There are no timestamps used in this project but best practice recommends that all direct and indirect uses of the timestamp should be considered.

## Forcibly Sending Ether to a Contract

It’s possible to force sending Ether to a contract without triggering its fallback function.

Mitigated against this risk by: This project doesn't use contract balance in critical logic.
