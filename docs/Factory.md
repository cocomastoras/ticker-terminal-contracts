# Factory documentation
Factory contract is used for deploying new BondingErc20 tokens and BondingCurves for the purpose of raising HYPE for a 
spot listing on HyperCore


## User Transactions reference
The possible user transactions are:

- registerNewTicker

Details are presented below:

### registerNewTicker
The __registerNewTicker__ action takes 3 arguments as input:
- name: string
- symbol: string
- uri: string

The __registerNewTicker__ function deploys a new __BondingErc20__ token, 

The __symbol__ must not have been deployed in the past on either __HyperCore__ nor the __Factory__ contract 

Reverts:
- InvalidTicker() if the ticker is being registered

Emits:
- NewToken(creator address, token address)


## Admin transactions reference

The possible admin transactions are:

- initializeTickerMarket
- addNewCoreTicker
- updateTokensCoreInfo
- updateStageLimits


Details are presented below:

### addNewCoreTicker
The __addNewCoreTickers__ action takes 1 argument as input:

- tickers: string

The __addNewCoreTickers__ action can only be called by the __Factory__ admin, it registers a new ticker that have been auctioned of on HyperCore.

Reverts:
- InvalidCaller(): If not correct caller


### initializeTickerMarket
The __initializeTickerMarket__ action takes 1 argument as input:

- token: address

The __initializeTickerMarket__ action can only be called by the __Factory__ admin, it deploys the __bondingCurve__ for the
given token and registers the addresses for easy traceability. After the call is successful the trading of the token can begin.

Reverts:
- InvalidCaller(): If not correct caller
- PairInitialized(): If token already has a __bondingCurve__

Emits:
- NewPair(address token, address bonding curve)

### updateTokensCoreInfo
The __updateTokensCoreInfo__ action takes 3 arguments as input:
- token: address
- corePairIndex_: uint256
- coreTokenId_: uint256
- coreTokenIndex_: uint256

The __updateTokensCoreInfo__ can only be called by the __Factory__ admin. Updates the token's info on the __HyperCore__ side for verification purposes

Reverts:
- InvalidCaller(): If not called by the admin

Emits:
- TokenRegistered(address token)


### updateStageLimits
The __updateStageLimits__ action takes 2 arguments as input:
- newTokenLimits: uint256[4]
- newNativeLimits: uint256[4]

The __updateStageLimits__ action can only be called by the __Factory__ admin. Updates the new limits on each stage of the bondingCurve(more on the BondingCurve documentation)

Reverts:
- InvalidCaller(): If not called by the admin

## Restricted access transactions reference

### bondCompleted
The __bondCompleted__ action takes 0 arguments as input:

The __bondCompleted__ action can only be called by the __BondingCurve__ of a __BondingERC20__ when the bonding curve is completes. It emits the corresponding event.

Reverts:
- InvalidCaller(): If not called by a valid Bonding curve

Emits:
- TokenBonded(address token, address bonding curve)

### tokenMigratedToAmm
The __tokenMigratedToAmm__ action takes 1 argument as input:
- pairAddress_: address

The __tokenMigratedToAmm__ action can only be called by the __BondingCurve__ of a __BondingERC20__ when the token is migrated to the AMM instead of the HyperCore. It emits the corresponding event.

Reverts:
- InvalidCaller(): If not called by a valid Bonding curve

Emits:
- TokenMigrated(address token, address pairAddress)

## View transactions reference

- getPairFromToken
- getTokenFromPair
- getLimitsForStage

Details are presented below:

### getPairFromToken
The __getPairFromToken__ action takes 1 argument as input:
- token address

Returns the Bonding curve's address of the given token or address(0) if not valid token.

### getTokenFromPair
The __getTokenFromPair__ action takes 1 argument as input:
- BondingCurve address

Returns the Token's address of the given bonding curve or address(0) if not valid bonding curve.

### getLimitsForStage
The __getLimitsForStage__ action takes 1 argumentS as input:
- stage: uint256

Returns the current limits for asked stage for token max reserves and native asks.

## Events:
    event NewToken(address indexed Creator, address indexed Token);
    event NewPair(address indexed Token, address indexed Pair);
    event TokenBonded(address indexed Token, address indexed Pair);
    event TokenRegistered(address indexed Token);
    event TokenMigrated(address indexed Token, address indexed Pair);
