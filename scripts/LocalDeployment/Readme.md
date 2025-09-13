1) Terminal-1) anvil --fork-url https://rpc.hyperliquid.xyz/evm --fork-block-number 4034912 --block-time 2 --gas-limit 30000000
2) Terminal-2) npx hardhat run scripts LocalDeployment/initNode.js --network anvil 
3) Terminal-2) npx hardhat run scripts LocalDeployment/(createToken.js, createManualBondingCurve.js, buyToken.js, sellToken.js) --network anvil

Read extra instructions in LocalDeployment files  

Use this as rpc for both wss and http http://127.0.0.1:8545/