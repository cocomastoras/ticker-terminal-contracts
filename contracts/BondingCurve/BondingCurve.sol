// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {IBERC20} from "../BondingErc20/Interfaces/IBERC20.sol";
import "solady/src/tokens/WETH.sol";
import {Factory} from "../Factory/Factory.sol";
import {BondingERC20} from "../BondingErc20/BondingERC20.sol";

interface IAMM {
    function createPair(address token0, address token1) external returns(address);
}

interface IPair {
    function mint(address to) external returns(uint);
}

contract BondingCurve {
    error InvalidCaller();
    error InvalidState();
    error SlippageReached();
    error InvalidInput();
    error InvalidRecipient();
    error NotEnoughReserves();
    error HypeTransferFailed();
    error TokenBonded();
    error BondingFailed();

    address private FACTORY = msg.sender;
    address private constant ROUTER = 0x13B8474c77BE8767829Ac879EdA070730e753260;

    address public token0;
    address public token1 = 0x5555555555555555555555555555555555555555; //WHYPE

    address private feeSink;
    address private admin;

    uint256 public currentStage = 0;
    uint256 private currentLimit = 0;

    uint256 private realReserve0 = 0; //4440 USDT TOTAL
    uint256 private realReserve1 = 0;
    uint256 private virtualReserve0 = 1000000000 * 10**18;
    uint256 private virtualReserve1 = 666 * 10**18;

    uint256 public isBonded;
    uint256 public bondedBlock;

    constructor(){}

    function initialize(address token0_, address feeSink_, address admin_, uint256 reserveLimit_, uint256 currentLimit_) external {
        require(token0 == address(0));
        require(msg.sender == FACTORY);
        token0 = token0_;
        feeSink = feeSink_;
        admin = admin_;
        realReserve0 = reserveLimit_;
        currentLimit = currentLimit_;
    }

    function swapBaseOut(address to, uint256 maxAmountIn, uint256 amountOut, bool swapIn) external returns(uint256, uint256){
        assembly {
            if iszero(eq(caller(), ROUTER)) {
                mstore(0x00, 0x48f5c3ed) //InvalidCaller
                revert(0x1c, 0x04)
            }

            if or(
                eq(maxAmountIn, 0),
                eq(amountOut, 0)
            ) {
                mstore(0x00, 0xb4fa3fb3) //InvalidInput
                revert(0x1c, 0x04)
            }
            if or(
                eq(to, sload(token0.slot)),
                eq(to, sload(token1.slot))
            ) {
                mstore(0x00, 0x9c8d2cd2) //InvalidRecipient
                revert(0x1c, 0x04)
            }
            if eq(sload(isBonded.slot), 1) {
                mstore(0x00, 0xb26a34b7) //TokenBonded
                revert(0x1c, 0x04)
            }
        }
        if(swapIn) {
            return _swapIn(to, maxAmountIn, amountOut);
        } else {
            return _swapOut(to, maxAmountIn, amountOut);
        }
    }

    function _swapIn(address to, uint256 maxAmountIn, uint256 amountOut) internal returns (uint256, uint256){
        assembly {
            mstore(0x60, sload(token1.slot))
            mstore(0x80, sload(token0.slot))

            mstore(0xa0, sload(realReserve0.slot))
            mstore(0xc0, sload(realReserve1.slot))
            mstore(0xe0, sload(virtualReserve0.slot))
            mstore(0x100, sload(virtualReserve1.slot))

            if eq(mload(0xa0), 0){
                mstore(0x00, 0xc6c13aa7) //NotEnoughReserves
                revert(0x1c, 0x04)
            }
            if gt(amountOut, mload(0xa0)) {
                amountOut := mload(0xa0)
            }
            let amountIn := div(mul(amountOut, mload(0x100)), sub(mload(0xe0), amountOut))
            let fee := div(amountIn, 100)
            if gt(add(amountIn, fee), maxAmountIn) {
                mstore(0x00, 0xa6d7690f) //SlippageReached
                revert(0x1c, 0x04)
            }
            sstore(realReserve1.slot, add(mload(0xc0), amountIn))
            sstore(virtualReserve1.slot, add(mload(0x100), amountIn))
            sstore(realReserve0.slot, sub(mload(0xa0), amountOut))
            sstore(virtualReserve0.slot, sub(mload(0xe0), amountOut))
            let excess := sub(maxAmountIn,add(amountIn, fee))
            //transfer whype to feeSink
            mstore(0x40, fee)
            mstore(0x2c, shl(96, sload(feeSink.slot))) // Store the `feeSink` argument.
            mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    eq(mload(0x00), 1),
                    call(gas(), mload(0x60), 0, 0x1c, 0x44, 0x00, 0x20)
                )
            ) {
               revert(0x0, 0x04) //WHype invoked error
            }
            if eq(sload(realReserve0.slot),0) {
                sstore(isBonded.slot, 1)
                sstore(bondedBlock.slot, number())
                mstore(0x00, 0x6cdf17ed)
                if iszero(call(gas(), sload(FACTORY.slot), 0, 0x1c, 0x04, 0x00, 0x00)) {
                    mstore(0x00, 0xd1b3d699)
                    revert(0x1c, 0x04)
                }
                excess := add(excess, sub(sload(realReserve1.slot), sload(currentLimit.slot)))
            }
            //withdraw excess wHype
            mstore(0x20, excess)
            mstore(0x00, 0x2e1a7d4d) // `withdraw(uint256)`.
            if iszero(call(gas(), mload(0x60), 0, 0x1c, 0x24, 0x00, 0x20)) {
               revert(0x0, 0x04) //WHype invoked error
            }
            //transfer token to user
            mstore(0x40, amountOut)
            mstore(0x2c, shl(96, to)) // Store the `to` argument.
            mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    eq(mload(0x00), 1),
                    call(gas(), mload(0x80), 0, 0x1c, 0x44, 0x00, 0x20)
                )
            ) {
               revert(0x0, 0x04) //Token invoked error
            }
            //transfer excess hype to user
            if iszero( call(gas(), to, excess, 0, 0, 0, 0)){
                mstore(0x00, 0xb071732c) //HypeTransferFailed
                revert(0x1c, 0x04)
            }
            mstore(0x00, amountIn)
            mstore(0x20, amountOut)
            return(0, 0x40)
        }
    }

    function _swapOut(address to, uint256 maxAmountIn, uint256 amountOut) internal returns (uint256, uint256){
        assembly {
            mstore(0x60, sload(token1.slot))
            mstore(0x80, sload(token0.slot))

            mstore(0xa0, sload(realReserve0.slot))
            mstore(0xc0, sload(realReserve1.slot))
            mstore(0xe0, sload(virtualReserve0.slot))
            mstore(0x100, sload(virtualReserve1.slot))

            if eq(mload(0xc0), 0){
                mstore(0x00, 0xc6c13aa7) //NotEnoughReserves
                revert(0x1c, 0x04)
            }
            if gt(amountOut, mload(0xc0)) {
                mstore(0x00, 0xc6c13aa7) //NotEnoughReserves
                revert(0x1c, 0x04)
            }
            let amountIn := div(mul(amountOut, mload(0xe0)),sub(mload(0x100), amountOut))
            if gt(amountIn, maxAmountIn) {
                mstore(0x00, 0xa6d7690f) //SlippageReached
                revert(0x1c, 0x04)
            }
            sstore(realReserve0.slot, add(mload(0xa0), amountIn))
            sstore(virtualReserve0.slot, add(mload(0xe0), amountIn))
            sstore(realReserve1.slot, sub(mload(0xc0), amountOut))
            sstore(virtualReserve1.slot, sub(mload(0x100), amountOut))
            let fee := div(amountOut, 100)
            //transfer wHype to feeSink
            mstore(0x40, fee)
            mstore(0x2c, shl(96, sload(feeSink.slot))) // Store the `feeSink` argument.
            mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    eq(mload(0x00), 1),
                    call(gas(), mload(0x60), 0, 0x1c, 0x44, 0x00, 0x20)
                )
            ) {
               revert(0x0, 0x04) //whype invoked error
            }
            //withdraw user's wHype
            mstore(0x20, sub(amountOut, fee))
            mstore(0x00, 0x2e1a7d4d) // `withdraw(uint256)`.
            if iszero(call(gas(), mload(0x60), 0, 0x1c, 0x24, 0x00, 0x20)) {
               revert(0x0, 0x04) //WHype invoked error
            }

            //transfer excess token to user
            mstore(0x40, sub(maxAmountIn, amountIn))
            mstore(0x2c, shl(96, to)) // Store the `to` argument.
            mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    eq(mload(0x00), 1),
                    call(gas(),  mload(0x80), 0, 0x1c, 0x44, 0x00, 0x20)
                )
            ) {
               revert(0x0, 0x04) //Token invoked error
            }
            //transfer hype to user
            if iszero(call(gas(), to, sub(amountOut, div(amountOut, 100)), 0, 0, 0, 0)){
                mstore(0x00, 0xb071732c) //HypeTransferFailed
                revert(0x1c, 0x04)
            }
            mstore(0x00, amountIn)
            mstore(0x20, amountOut)
            return(0, 0x40)
        }
    }

    function withdrawHype() external {
        assembly {
            let token := sload(token1.slot)
            if iszero(eq(caller(), sload(admin.slot))) {
                mstore(0x00, 0x48f5c3ed) //InvalidCaller
                revert(0x1c, 0x04)
            }
            if eq(sload(isBonded.slot), 0) {
                mstore(0x00, 0xbaf3f0f7) //InvalidState
                revert(0x1c, 0x04)
            }
            let m := mload(0x40)
            //Get the BondingCurve's balance of token
            mstore(0x0c, 0x70a08231000000000000000000000000)
            mstore(0x2c, shl(96, address()))
            pop(staticcall(gas(), token, 0x1c, 0x24, 0x20, 0x20))
            //withdraw hype balance
            mstore(0x00, 0x2e1a7d4d) // `withdraw(uint256)`.
            if iszero(call(gas(), token, 0, 0x1c, 0x24, 0x00, 0x20)) {
               revert(0x0, 0x04) //WHype invoked error
            }
            if iszero(call(gas(), caller(), balance(address()), 0, 0, 0, 0)){
                mstore(0x00, 0xb071732c) //HypeTransferFailed
                revert(0x1c, 0x04)

            }
        }
    }

    function increaseTarget() external payable{
        require(msg.sender == admin ,'1');
        require(isBonded == 1, '2');
        address wHype = 0x5555555555555555555555555555555555555555;
        uint256 value = msg.value > 0 ? msg.value : WETH(payable(wHype)).balanceOf(address(this));
        require(value == currentLimit, '3');
        uint256 stage_ = currentStage;
        (uint256 nextLimit, uint256 nextReserve0) = Factory(FACTORY).getLimitsForStage(stage_ + 1);
        currentStage += 1;
        realReserve0 = nextReserve0;
        currentLimit = nextLimit;
        realReserve1 = value;
        virtualReserve1 = value + 666 * 10**18;
        isBonded = 0;
        bondedBlock = 0;
        if (msg.value > 0) {
            assembly {
                mstore(0x00, 0xd0e30db0)
                if iszero(call(gas(), wHype, callvalue(), 0x1c, 0x04, 0x00, 0x20)) {
                    mstore(0x00, 0x99825cc2) //HypeDepositFailed
                    revert(0x1c, 0x04)
                }
            }
        }
    }

    function migrateToAmm() external payable {
        require(msg.sender == admin);
        require(WETH(payable(token1)).balanceOf(address(this)) == currentLimit);
        require(isBonded == 1);
        address ammFactory = 0x724412C00059bf7d6ee7d4a1d0D5cd4de3ea1C48;
        address pair = IAMM(ammFactory).createPair(token0, token1);
        BondingERC20(token0).makeItStandardErc20(pair);
        Factory(payable(FACTORY)).tokenMigratedToAmm(pair);
        WETH(payable(token1)).transfer(pair, currentLimit);
        BondingERC20(token0).transfer(pair, BondingERC20(token0).balanceOf(address(this)));
        IPair(pair).mint(0x000000000000000000000000000000000000dEaD);
    }

    function getReserves() public view returns (uint256 _reserve0, uint256 _reserve1, uint256 _vReserve0, uint256 _vReserve1, uint256 target) {
        _reserve0 = realReserve0; // Real token reserves
        _reserve1 = realReserve1; // Real hype reserves
        _vReserve0 = virtualReserve0; // Virtual token reserves
        _vReserve1 = virtualReserve1; // Virtual hype reserves
        target = currentLimit;
    }

    receive() payable external {}
}

