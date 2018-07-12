# Consensys Academy 2018

## Description

What project does. How to set it up.

## Running Project

Clone project: ```git clone https://github.com/johngrantuk/colonyHackathon.git```

```cd colonyHackathon```

Then: ```npm install```

Then: ```npm start```

Make sure the local Colony test network is running. All from the local Colony contract folder:

Run Ganache: ```ganache-cli -d --gasLimit 7000000 --acctKeys ganache-accounts.json --noVMErrorsOnRPCResponse```

Deploy Colony contracts:
```./node_modules/.bin/truffle migrate --compile-all —reset```

Start Truggle Pig:
``` trufflepig --ganacheKeyFile ganache-accounts.json```

## Team Members and Contact info

John: @johngrantuk on github, johngrantuk@googlemail.com

## Additional Materials

Here's my [demo video](https://youtu.be/_V_vWxrxdo0).

[Medium post](https://medium.com/@johngrant/ethereum-development-colony-hackathon-consenys-academy-react-8fc845ea47f1).
