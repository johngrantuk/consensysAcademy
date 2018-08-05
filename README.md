# Consensys Academy 2018

## Description

The project name is **What Is It?**. It is essentially a Bounty DApp. Anyone can upload a picture of an item they want identified along with an associated bounty in Eth. Other users can post answers detailing what they think the item is. The original poster can accept the answer of their choice which allows the bounty to be claimed.

## Running Project

Clone project: ```git clone https://github.com/johngrantuk/consensysAcademy.git```

```cd consensysAcademy```

Then: ```npm install``` (this can take a while)

Make sure ganache is running: ```ganache-cli```

Deploy contracts (from project directory): ```truffle migrate```

Then start the local dev server: ```npm start```

Remember to login with Metamask to Localhost 8545 (get keys from ganache-cli).

Tests can be run using ```truffle test```

## Project Details

The main page of the app shows the users current account (from MetaMask). It shows the number of Items currently submitted along with details for these items (taken from the blockchain). There is a button that allows users to add a new Item. There is also the option to authenticate via UPort and get an up to date Eth/USD price via an Oracle.

### Contracts ###

#### Parent ####

Parent contract is responsible for managing Item contracts which are upgradeable and use permanent storage from ItemStorage contract.

#### ItemInterface ####

This is the interface any upgradeable Item contract must adhere to.

#### ItemStorage ####

Contract that implements permanent storage that can be used with upgradeable Item contracts.

This contract has a circuit breaker that could be called to pause operation in the event of something like a bug being found. There is also a kill option.

#### ItemUpgradeable ####

The main Item functionality.

#### OracleEthPrice ####

Contract demonstrates how an Oracle can be implemented to store the Eth/USD price to the blockchain. Shows two options, a self-written Oracle that can be run on a local test set-up, i.e. using ganache. And a second version using Oraclize.

### Testing ###

A total of over 80 tests were written for the contracts using both Solidity and Javascript.

Tests can be run using ```truffle test```

### Design Patterns ###

The design patterns used are described in [design_pattern_descision.md](design_pattern_descision.md).

### Avoiding Common Attacks ###

Details on the steps taken to write secure code avoiding common attacks are described in [avoiding_common_attack.md](avoiding_common_attack.md).

### Library Use ###

The project imports multiple libraries from the [OpenZeppelin](https://openzeppelin.org/api/docs/open-zeppelin.html) project including, Ownable, Destructible and SafeMath.

### IPFS ###
When a new Item is created it has a picture along with associated data such as bounty, owner address, additional info, etc. Storing information on the Ethereum blockchain is expensive so it makes sense to store the bulk of the data somewhere else and only store a reference to this location on the blockchain. In this case IPFS was used as it maintains decentralisation.

To avoid having to use a local IPFS daemon the Infura node is used along with the JS-IPFS-API library (see ifpsHelper.js).

Two separate IPFS uploads are made for each Item, one for the picture itself and one for the Item data. Each answer also has it's information uploaded.

### uPort ###

uPort is integrated giving users the option to authenticate via the uPort app and attach their identity to any Item or Answer they submit.

### Oracle ###

To allow users to set an appropriate Eth bounty for their item an Oracle has been written that stores the latest Eth/USD price retrieved from Coin Market Cap.

### Upgradeable ###

The contracts are designed to separate the data and logic. The Parent contract is responsible for managing Item contracts which are upgradeable and use permanent storage from ItemStorage contract. This allows the functionality to be upgraded without the expenses of also having to redeploy storage. Basically the storage is permanent and new contracts point to it. An Item interface is used to decouple inter-contract communication and avoid the Parent having to be redeployed every time we upgrade.

Two posts that were guides for this pattern are [here](https://blog.colony.io/writing-upgradeable-contracts-in-solidity-6743f0eecc88) and [here](https://medium.com/@nrchandan/interfaces-make-your-solidity-contracts-upgradeable-74cd1646a717).

### Testnet deployed ###

Contracts were deployed (following this [guide](https://medium.com/@pauliax/deploying-truffle-contracts-to-all-networks-without-running-your-own-nodes-9e619ad9f4da)) to Rinkeby.

OracleEthPrice Address: 0xe6ea450334468b28dbF5f3A64Fb166eB2C308bF1

ItemUpgradeable Address: 0xd6a8aaaab5c56d66d575d1c34cb990a9c6c819f4

Deploying Parent Address: 0x95cc7de7051b3064b1a3970f39f008619c27db84

ItemUpgradeable set-up as first version with storage
  Tx Hash: 0x6466ed8244069e77ac5eb4f4fafd6ba6ee342d0af2ea031ce2adc2d131b9cd2d


## Contact info

John: @johngrantuk on github, johngrantuk@googlemail.com
