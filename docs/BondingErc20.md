# BondingERC20 documentation
BondingERC20 contract is a modification of ERC20 contract and is used as token0 in bonding curves. If this token migrates to the AMM instead of the HyperCore's spot then it's upgraded to a standard ERC20 token


## User Transactions reference
The possible user transactions are:

- transferAndCall

Details are presented below:

### transferAndCall
The __transferAndCall__ action takes 2 arguments as input:
- amount: uint256
- amountOut: uint256

The __transferAndCall__ transfers the given amount to the __Router__ contract and then calls it. With this flow user doesn't need a 2 step for selling a token.

Reverts:
- All ERC20 errors
- TokenIsERC20(): If token migrates to an AMM instead to HyperCore spot then this method is no longer available.
- NotValidTransfer(): If token is still type of BondingERC20 then the only appropriate transfers are from/to the __Router__ contract 


## Inner Transactions reference
The possible user transactions are:

- _beforeTokenTransfer

Details are presented below:

### _beforeTokenTransfer
The ___beforeTokenTransfer__ action takes 3 arguments as input:

- from: address
- to: address
- amount: uint256

The ___beforeTokenTransfer__ function checks the type of the token and if it's still a BondingErc20 then checks tha the transfer is performed through the __Router__ contract.

Reverts:
- NotValidTransfer(): If token is still type of BondingERC20 then the only appropriate transfers are from/to the __Router__ contract 


## Restricted access transactions reference

### setBondingCurve
The __setBondingCurve__ action takes 1 argument as input:
- bc_: address

The __setBondingCurve__ action can only be called by the __Factory__ contract. Setting the bonding curve's address and minting the total supple to the that address.

Reverts:
- InvalidCaller(): If not called by the __Factory__

### updateCoreInfo
The __updateCoreInfo__ action takes 5 arguments as input:
- corePairName_: address
- corePairIndex_: address
- coreTokenId_: address
- coreTokenIndex_: uint256

The __updateCoreInfo__ action can only be called by the __Factory__ contract. It sets the core's info for the token when registered on HyperCore spot

Reverts:
- InvalidCaller(): If not called by the __Factory__
- CoreRegistered(): If inforamtion allready being set
- TokenNotBondedYet(): If token not bonded

### makeItStandardErc20
The __makeItStandardErc20__ action takes 0 arguments as input:

The __makeItStandardErc20__ action can only be called by the __Factory__ contract. It upgrades the token to a standard ERC20

Reverts:
- InvalidCaller(): If not called by the __Factory__


## View transactions reference

- getTokenInfo

Details are presented below:

### getTokenInfo
The __getTokenInfo__ action takes 0 arguments as input:

Returns the token's information. Name, Symbol. Uri, Bonding curve address, Core Info if registered, block number the pool deployed and timestamp
