const TOKEN_ABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_symbol",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_uri",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AllowanceOverflow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AllowanceUnderflow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CoreRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidCaller",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPermit",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotValidTransfer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Permit2AllowanceIsFixedAtInfinity",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PermitExpired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenIsERC20",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenNotBondedYet",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TotalSupplyOverflow",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DOMAIN_SEPARATOR",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "result",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTokenInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "ammAddress_",
          "type": "address"
        }
      ],
      "name": "makeItStandardErc20",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "nonces",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "permit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "bc_",
          "type": "address"
        }
      ],
      "name": "setBondingCurve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "limit",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "twap",
          "type": "address"
        }
      ],
      "name": "setLoAndTwap",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "name": "transferAndCall",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "coreTokenId_",
          "type": "uint256"
        }
      ],
      "name": "updateCoreInfo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "uri",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "From",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "Pair",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "Token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "AmountIn",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "AmountOut",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Real0",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Real1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Virtual0",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Virtual1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Target",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Side",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "HypePrice",
          "type": "uint256"
        }
      ],
      "name": "Swap",
      "type": "event"
    }
]
const BC_ABI= [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "BondingFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "HypeTransferFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidCaller",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInput",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRecipient",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidState",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEnoughReserves",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SlippageReached",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenBonded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "bondedBlock",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentStage",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getReserves",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_reserve0",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_reserve1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_vReserve0",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_vReserve1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "target",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "increaseTarget",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token0_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "feeSink_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "admin_",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "reserveLimit_",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "currentLimit_",
          "type": "uint256"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isBonded",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "migrateToAmm",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxAmountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "swapIn",
          "type": "bool"
        }
      ],
      "name": "swapBaseOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token0",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token1",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawHype",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ]
const tickers = ['USDC','PURR','HFUN','LICK','MANLET','JEFF','SIX','WAGMI','CAPPY','POINTS','TRUMP','GMEOW','PEPE','XULIAN','RUG','ILIENS','FUCKY','CZ','BAGS','ANSEM','TATE','FUN','SUCKY','BIGBEN','KOBE','VEGAS','PUMP','SCHIZO','CATNIP','HAPPY','SELL','HBOOST','FARMED','PURRPS','GUP','GPT','PANDA','BID','HODL','RAGE','ASI','LEAP','VAPOR','PVP','X','PILL','ADHD','LADY','CAT','HPEPE','MBAPPE','MAGA','MOG','OMNIX','COKE','JEET','DROP','CBD','ARI','TEST','KING','MEOW','ANT','FRAC','ATEHUN','FRCT','COZY','WASH','POP','NFT','JEFE','PEAR','RICH','BRIDGE','GUESS','LORA','CATBAL','TJIF','NEIRO','TIME','BERA','ANGY','DOG','MOON','MAXI','PAIN','VDO','HQ','EUR','REGARD','YUM','REKT','NMTD','HPUMP','PIGEON','LAUNCH','IRL','RISE','WOW','CINDY','CHINA','STACK','FRIED','PICKL','SHREK','NOCEX','VAULT','RANK','L','H','G','SCAM','MONAD','BOZO','RIP','UP','GIGA','FELIX','SPH','STHYPE','HPL','KHYPE','HOPE','SHOE','KNTQ','BUSSY','FATCAT','PIP','YEETI','LQNA','NASDAQ','SYLVI','FEIT','STRICT','FRUDO','VIZN','AUTIST','HGOD','LIQUID','CHEF','AZUR','EARTH','NIGGO','LUCKY','HOP','FAN','MUNCH','COPE','HPYH','YAP','HYPE','STEEL','RETARD','HOLD','STAR','WATAR','GENESY','SOLV','BUBZ','SHEEP','HYFI','FARM','FLASK','SOVRN','MON','GOD','CREAM','ANIME','HYENA','ETHC','ANZ','GAME','RIFT','SWELL','DEPIN','ROUTE','BEATS','ORA','LIQD','XBG','HETU','GG','WOOL','ISLAND','SIPHER','DBR','SENT','FLY','SSS','HWTR','NEKO','UNIT','PEG','NEURAL','PIE','DRIVE','JPEG','UBTC','TGE','HEAD','EDGE','GEN','PRFI','REI','VORTX','HAR','DEFIN','APU','MOCA','TILT','SPR','HIPPO','HANA','SWAP','MORE','LOOT','LUMI','WHYPI','ANON','OTTI','HORSY','UETH','BUDDY','LATINA','WLFI','AIR','K','PLUME','LIM','HUSD','DHYPE','EDA','FUND','EXP', 'SENTI', 'USDE', 'HIP', 'SLAY', 'B', 'USDXL', 'USH', 'FEUSD', 'COOK', 'OKI', 'BORG', 'SIGN', 'WMNT', 'KITTEN', 'USR', 'LEND', 'CATH', 'QUANT', 'ONLYUP', 'RAT', 'USOL', 'PURRO', 'KITTY', 'TREND', 'COIN', 'STORM', 'RISK', 'PLAY', 'NET', 'LOOP', 'LTHREE', 'WELL', 'WAVE']

module.exports = {
  TOKEN_ABI,
  BC_ABI,
  tickers
};