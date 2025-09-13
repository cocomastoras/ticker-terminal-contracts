// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract Spot_Precompile {
    constructor(){}

    fallback(bytes calldata) external returns(bytes memory){
        bytes memory result = abi.encode(36921000);
        return result;
    }
}
