# BondingCurve documentation
BondingCurve contract is used as a pre-market for a ticker, before auctioning on HyperCore. 


## User Transactions reference
The possible user transactions are:

- swapBaseOut

Details are presented below:

### swapBaseOut
The __swapBaseOut__ action takes 4 arguments as input:
- to: address
- maxAmountIn: uint256
- amountOut: uint256
- swapIn: bool

The __swapBaseOut__ function checks the validity of the data passed and then calls the appropriate inner transactions

Reverts:
- InvalidCaller(): If not called by the __ROUTER__ contract
- InvalidInput(): If maxAmountIn or amountOut equals 0
- InvalidRecipient(): If the to address is either the token0 or token1 of the pair
- TokenBonded(): If the bonding curve is completed and no further trading is permitted

Returns:
- amountIn: uint256, The actual amountIn traded in the swap
- amountOut: uint256, The amountOut of the swap


## Inner Transactions reference
The possible user transactions are:

- _swapIn
- _swapOut

Details are presented below:

### _swapIn
The ___swapIn__ action takes 3 arguments as input:
- to: address
- maxAmountIn: uint256
- amountOut: uint256

The ___swapIn__ function performs an exactAmountOut swap of Native token to BondingErc20 token, and returns excess input to the to address.
The swap takes a 1% fee of the input that is transferred to the feeSink address. If the amountOut is greater than the available reserves then the calculation are performed with amountOut equal the maxReserves available and completes the bonding curve.

Reverts:
- NotEnoughReserves(): If there are not enough Token reserves in the Bonding curve for the given Amount in
- SlippageReached(): If maxAmountIn is not enough for asked amountOut

Returns:
- amountIn: uint256, The actual amountIn traded in the swap
- amountOut: uint256, The amountOut of the swap

### _swapOut
The ___swapOut__ action takes 3 arguments as input:
- to: address
- maxAmountIn: uint256
- amountOut: uint256

The ___swapOut__ function performs an exactAmountOut swap of BondingErc20 token to Native token, and returns excess input to the to address.
The swap takes a 1% fee of the output that is transferred to the feeSink address.

Reverts:
- NotEnoughReserves(): If there are not enough Native reserves in the Bonding curve for the given Amount in
- SlippageReached(): If maxAmountIn is not enough for asked amountOut or amount

Returns:
- amountIn: uint256, The actual amountIn traded in the swap
- amountOut: uint256, The amountOut of the swap



## Admin transactions reference

The possible admin transactions are:

- withdrawHype
- increaseTarget
- migrateToAmm


Details are presented below:

### withdrawHype
The __withdrawHype__ action takes 0 arguments as input:

The __withdrawHype__ action can only be called by the Admin, withdraws available Hype balance of the bonding curve to the admin address in order to put an auction offer for the ticker of the token.

Reverts:
- InvalidCaller(): If not called by the admin
- InvalidState(): If Bonding curve is not completed


### increaseTarget
The __increaseTarget__ action takes 0 arguments as input:

The __increaseTarget__ action can only be called by the Admin if the Auction offer fails three times because of Gas required being higher than available,
it redeploys the liquidity in the bondingCurve and sets a new target.

Reverts:
- InvalidCaller(): If not correct caller
- InvalidState(): If Bonding curve is not completed
- InvalidValue(): If redeployed liquidity is not equal to the one pulled


### migrateToAmm
The __migrateToAmm__ action takes 0 arguments as input:

The __migrateToAmm__ can only be called by the Admin if the Bonding curve is completed and the ticker has already been 
auctioned on the HyperCore side. Then all the available liquidity is being migrated to a HyperSwap V2 pool and the 
BondingErc20 token is upgraded to an ERC20 token.

Reverts:
- InvalidCaller(): If not correct caller
- InvalidState(): If Bonding curve is not completed
- InvalidValue(): If available liquidity is not equal to stage's limit

## Restricted access transactions reference

### initialize
The __initialize__ action takes 5 arguments as input:
- token0_: address
- feeSink_: address
- admin_: address
- reserveLimit_: uint256
- currentLimit_: uint256

The __initialize__ action can only be called by the __Factory__ contract. It initializes the Bonding curve setting the
current stage's token and native limits

Reverts:
- InvalidCaller(): If not called by the __Factory__
- AlreadyInitialised(): If token0 is not address(0)


## View transactions reference

- getReserves

Details are presented below:

### getReserves
The __getReserves__ action takes 0 arguments as input:

Returns the current real and virtual reserves in the bonding curve.
