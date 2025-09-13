// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import "solady/src/tokens/WETH.sol";
import {BondingERC20} from "../BondingErc20/BondingERC20.sol";

contract Router {
    error InvalidCaller();
    error InvalidMaxAmountIn();
    error HypeDepositFailed();
    error TransferFailed();
    error InvalidToken();
    error InvalidInput();
    error InvalidRecipient();
    error NotEnoughReserves();
    error SlippageReached();
    error HypeTransferFailed();
    error SwapFailed();

    event Swap(address indexed From, address indexed Pair, address indexed Token, uint256 AmountIn, uint256 AmountOut, uint256 Real0, uint256 Real1, uint256 Virtual0, uint256 Virtual1, uint256 Target, uint256 Side, uint256 HypePrice);

    constructor(){}

    function buy(address token, uint256 exactAmountOut) external payable {
        address wHype = 0x5555555555555555555555555555555555555555;
        address factory = 0x46F4e976C10E289e5F896B20fF15C1C497f0E1F3;
        address SPOT_PX_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000808;
        assembly {
            let m := mload(0x40)
            let maxAmountIn  := callvalue()
            //Check that the message has value
            if eq(maxAmountIn, 0) {
                mstore(0x00, 0x04eb8ece) //InvalidMaxAmountIn
                revert(0x1c, 0x04)
            }
            //Wrap msg.value to wHype
            mstore(0x00, 0xd0e30db0)
            if iszero(call(gas(), wHype, maxAmountIn, 0x1c, 0x04, 0x00, 0x20)) {
                mstore(0x00, 0x99825cc2) //HypeDepositFailed
                revert(0x1c, 0x04)
            }

            //Get the bc address for the token given
            mstore(0x0c, 0xcb0149c8000000000000000000000000)
            mstore(0x2c, shl(96, token))
            pop(staticcall(gas(), factory, 0x1c, 0x24, 0x00, 0x20))
            let bondingCurve := mload(0x00)
            //Check BondingCurve exists
            if iszero(bondingCurve) {
                mstore(0x00, 0xc1ab6dc1) //InvalidToken
                revert(0x1c, 0x04)
            }
            //Transfer wHype to BondingCurve
            mstore(0x40, maxAmountIn)
            mstore(0x2c, shl(96, bondingCurve)) // Store the `to` argument.
            mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    eq(mload(0x00), 1),
                    call(gas(), wHype, 0, 0x1c, 0x44, 0x00, 0x20)
                )
            ) {
               revert(0x0, 0x04)
            }
            mstore(0x0c, 0xc48b0089000000000000000000000000)
            mstore(0x2c, shl(96, caller()))
            mstore(0x40, maxAmountIn)
            mstore(0x60, exactAmountOut)
            mstore(0x80, 1)
            // Call Bondingcurve and perform the swap
             if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    eq(returndatasize(), 0x40),
                    call(gas(), bondingCurve, 0, 0x1c, 0x84, 0x00, 0x40)
                )
            ) {
                revert(0, 0x04) //Bonding curve error code
            }
            mstore(0x40, 0x0902f1ac00000000000000000000000000000000000000000000000000000000) //getReserves()
            pop(staticcall(gas(), bondingCurve, 0x40, 0x04, 0x40, 0xa0))
            mstore(0xe0, 0)
            mstore(0x100, 0x000000000000000000000000000000000000000000000000000000000000040b)
            pop(staticcall(gas(), SPOT_PX_PRECOMPILE_ADDRESS, 0x100, 0x20, 0x100, 0x20))
            let t1 := 0x2f89a1b20971b5838243edacc9cfd61dd3b0d4901cefe2149cdbbfc7f74bd92a
            log4(0x00, 0x120, t1, caller(), bondingCurve, token)
            mstore(0x40, m)
        }
    }

    function sell(address token, address to, uint256 exactAmountOut) external returns(bool){
        address factory = 0x46F4e976C10E289e5F896B20fF15C1C497f0E1F3;
        address SPOT_PX_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000808;
        assembly {
            let m := mload(0x40)
            if iszero(eq(caller(), token)) {
                mstore(0x00, 0x48f5c3ed) //InvalidCaller
                revert(0x1c, 0x04)
            }
            //Get the Router's balance of token
            mstore(0x0c, 0x70a08231000000000000000000000000)
            mstore(0x2c, shl(96, address()))
            pop(staticcall(gas(), token, 0x1c, 0x24, 0x00, 0x20))
            let maxAmountIn := mload(0)

            //Revert if balance is 0
            if eq(maxAmountIn, 0) {
                mstore(0x00, 0x04eb8ece) //InvalidMaxAmountIn
                revert(0x1c, 0x04)
            }

            //Get the bc address for the token given
            mstore(0x0c, 0xcb0149c8000000000000000000000000)
            mstore(0x2c, shl(96, token))
            pop(staticcall(gas(), factory, 0x1c, 0x24, 0x00, 0x20))
            let bondingCurve := mload(0x00)
            //Check BondingCurve exists
            if iszero(bondingCurve) {
                mstore(0x00, 0xc1ab6dc1) //InvalidToken
                revert(0x1c, 0x04)
            }

            //Transfer token to BondingCurve
            mstore(0x40, maxAmountIn)
            mstore(0x2c, shl(96, bondingCurve)) // Store the `to` argument.
            mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    eq(mload(0x00), 1),
                    call(gas(), token, 0, 0x1c, 0x44, 0x00, 0x20)
                )
            ) {
                  revert(0x0, 0x04)
            }
            mstore(0x0c, 0xc48b0089000000000000000000000000)
            mstore(0x2c, shl(96, to))
            mstore(0x40, maxAmountIn)
            mstore(0x60, exactAmountOut)
            mstore(0x80, 0)
            // Call Bondingcurve and perform the swap
             if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    eq(returndatasize(), 0x40),
                    call(gas(), bondingCurve, 0, 0x1c, 0x84, 0x00, 0x40)
                )
            ) {
                revert(0x00, 0x04) // Bonding curve error
            }
            mstore(0x40, 0x0902f1ac00000000000000000000000000000000000000000000000000000000) //getReserves()
            pop(staticcall(gas(), bondingCurve, 0x40, 0x04, 0x40, 0xa0))
            mstore(0xe0, 1)
            mstore(0x100, 0x000000000000000000000000000000000000000000000000000000000000040b)
            pop(staticcall(gas(), SPOT_PX_PRECOMPILE_ADDRESS, 0x100, 0x20, 0x100, 0x20))
            let t1 := 0x2f89a1b20971b5838243edacc9cfd61dd3b0d4901cefe2149cdbbfc7f74bd92a
            log4(0x00, 0x120, t1, origin(), bondingCurve, token)
            mstore(0x40, m)
        }
        return true;
    }

    function getAmountOut(address token, uint256 amountIn, bool swapIn) external view returns(uint256 amountOut) {
        address factory = 0x46F4e976C10E289e5F896B20fF15C1C497f0E1F3;
        assembly {
            let m := mload(0x40)
            //Get the bc address for the token given
            mstore(0x0c, 0xcb0149c8000000000000000000000000)
            mstore(0x2c, shl(96, token))
            pop(staticcall(gas(), factory, 0x1c, 0x24, 0x00, 0x20))
            let bondingCurve := mload(0x00)
            //Check BondingCurve exists
            if iszero(bondingCurve) {
                mstore(0x00, 0xc1ab6dc1) //InvalidToken
                revert(0x1c, 0x04)
            }
            mstore(0x00, 0x0902f1ac00000000000000000000000000000000000000000000000000000000) //getReserves()
            if iszero(staticcall(gas(), bondingCurve, 0x0, 0x04, 0x60, 0x80)){
                revert(0,0)
            }
            let _reserve0 := mload(0x60)
            let _reserve1 := mload(0x80)
            let _vReserve0 := mload(0xa0)
            let _vReserve1 := mload(0xc0)
            if eq(swapIn, 1) {
                amountIn := div(mul(amountIn, 99), 100)
                amountOut := div(mul(amountIn, _vReserve0), add(amountIn, _vReserve1))
                if gt(amountOut, _reserve0) {
                    amountOut := _reserve0
                }
            }
            if eq(swapIn, 0) {
                amountOut := div(mul(amountIn, _vReserve1), add(amountIn, _vReserve0))
                if gt(amountOut, _reserve1) {
                    amountOut := _reserve1
                }
            }
        }
    }

    function getReservesForTokenSingle(address token) external view returns (uint256 reserves0,uint256 reserves1, uint256 vReserves0,uint256 vReserves1, uint256 target, address bondingCurve, uint256 hypePrice) {
        address SPOT_PX_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000808;
        address factory = 0x46F4e976C10E289e5F896B20fF15C1C497f0E1F3;
        assembly {
            mstore(0x00, 0x000000000000000000000000000000000000000000000000000000000000040b)
            pop(staticcall(gas(), SPOT_PX_PRECOMPILE_ADDRESS, 0x00, 0x20, 0x00, 0x20))
            hypePrice := mload(0)
            //Get the bc address for the token given
            mstore(0x0c, 0xcb0149c8000000000000000000000000)
            mstore(0x2c, shl(96, token))
            pop(staticcall(gas(), factory, 0x1c, 0x24, 0x00, 0x20))
            bondingCurve := mload(0x00)
            mstore(0x00, 0x0902f1ac00000000000000000000000000000000000000000000000000000000) //getReserves()
            if iszero(staticcall(gas(), bondingCurve, 0x0, 0x04, 0x60, 0xa0)){
                revert(0,0)
            }
            reserves0 := mload(0x60)
            reserves1 := mload(0x80)
            vReserves0 := mload(0xa0)
            vReserves1 := mload(0xc0)
            target := mload(0xe0)
        }
    }

    function getReservesForTokenMulti(address[] memory tokens) external view returns (uint256[] memory reserves0, uint256[] memory reserves1, uint256[] memory vReserves0, uint256[] memory vReserves1, uint256[] memory targets, address[] memory bondingCurves, uint256 hypePrice) {
        address factory = 0x46F4e976C10E289e5F896B20fF15C1C497f0E1F3;
        reserves0 = new uint256[](tokens.length);
        reserves1 = new uint256[](tokens.length);
        vReserves0 = new uint256[](tokens.length);
        vReserves1 = new uint256[](tokens.length);
        targets = new uint256[](tokens.length);
        bondingCurves = new address[](tokens.length);
        uint256 tokensLength = tokens.length;
        assembly {
            mstore(0x00, 0x000000000000000000000000000000000000000000000000000000000000040b)
            mstore(0x20, 0x0000000000000000000000000000000000000808)
            pop(staticcall(gas(), mload(0x20), 0x00, 0x20, 0x00, 0x20))
            hypePrice := mload(0)
            for { let i := 0 } lt(i, tokensLength) { i := add(i, 1) } {
                let index := mul(add(i, 1), 0x20)
                let token := mload(add(tokens, index))
                mstore(0x0c, 0xcb0149c8000000000000000000000000)
                mstore(0x2c, shl(96, token))
                pop(staticcall(gas(), factory, 0x1c, 0x24, 0x00, 0x20))
                let bondingCurve := mload(0x00)
                mstore(add(bondingCurves, index), bondingCurve)
                let size := msize()
                mstore(0x00, 0x0902f1ac00000000000000000000000000000000000000000000000000000000) //getReserves()
                if iszero(staticcall(gas(), bondingCurve, 0x0, 0x04, size, 0xa0)){
                    revert(0,0)
                }
                mstore(add(reserves0, index), mload(size))
                mstore(add(reserves1, index), mload(add(size, 0x20)))
                mstore(add(vReserves0, index), mload(add(size, 0x40)))
                mstore(add(vReserves1, index), mload(add(size, 0x60)))
                mstore(add(targets, index), mload(add(size, 0x80)))
            }
        }
    }
}
