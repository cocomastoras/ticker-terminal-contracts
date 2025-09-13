require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.23",
  gasReporter: {
    enabled: true
  },
  networks: {
    hardhat: {
      chains: {
        8453: {
          hardforkHistory: {
            cancun: 19718907
          }
        }
      },
      forking: {
        enabled: true,
        url: "https://rpc.hyperliquid.xyz/evm",
        timeout: 60000,
        blockNumber: 4034912
      }
    },
    anvil: {
      url: process.env.NETWORK_URL || "http://192.168.1.7:8545"
    },
    hypeTestnet: {
      url: ''
    },
    hostedLocal: {
      url: ''
    }
  }
};

