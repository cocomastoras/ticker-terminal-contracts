# Router documentation
Router contract is used for all the trading of the BondingERC20 tokens.

## User Transactions reference
The possible user transactions are:

- buy
- sell

Details are presented below:

### buy
The __buy__ action takes 2 arguments as input:
- token: address
- exactAmountOut: uint256

The __buy__ function wraps the native Hype to WHYPE and calls the corresponding __BondingCurve__ to perform the swap.

Reverts:
- InvalidMaxAmountIn(): if msg.value equals 0
- HypeDepositFailed(): If Hype wrapping fails
- InvalidToken(): If given token is not a valid BondingERC30 token

Emits:
- Swap(address indexed From, address indexed Pair, address indexed Token, uint256 AmountIn, uint256 AmountOut, uint256 Side)

### sell
The __sell__ action takes 3 arguments as input:
- token: address
- to: address
- exactAmountOut: uint256

The __sell__ function transfers the token to the Bonding curve to perform the swap.

Reverts:
- InvalidCaller(): If not called directly by the token contract
- InvalidMaxAmountIn(): if tokens balance of the __Router__ equals 0
- InvalidToken(): If given token is not a valid BondingERC30 token

Emits:
- Swap(address indexed From, address indexed Pair, address indexed Token, uint256 AmountIn, uint256 AmountOut, uint256 Side)


## View transactions reference

- getAmountOut
- getReservesForTokenSingle
- getReservesForTokenMulti

Details are presented below:

### getAmountOut
The __getAmountOut__ action takes 3 arguments as input:
- token: address
- amountInt: uint256
- swapIn: bool

Returns the expected amountOut of the swap

### getReservesForTokenSingle
The __getReservesForTokenSingle__ action takes 1 argument as input:
- token: address

Returns the real and virtual reserves of the corresponding bonding curve and the bonding curve address

### getReservesForTokenMulti
The __getReservesForTokenMulti__ action takes 1 argument as input:
- tokens: address[]

Returns the real and virtual reserves of the corresponding bonding curves and the bonding curves addresses

## Events:
    event Swap(address indexed From, address indexed Pair, address indexed Token, uint256 AmountIn, uint256 AmountOut, uint256 Side);