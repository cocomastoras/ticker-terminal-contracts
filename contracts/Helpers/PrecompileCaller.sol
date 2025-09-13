// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract PrecompileCaller {
    constructor(){}

    function getHypePrice() external view returns(uint256 hypePrice) {
        address SPOT_PX_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000808;
        assembly {
            mstore(0x00, 0x000000000000000000000000000000000000000000000000000000000000040b)
            pop(staticcall(gas(), SPOT_PX_PRECOMPILE_ADDRESS, 0x00, 0x20, 0x00, 0x20))
            hypePrice := mload(0)
        }
    }

    function fetchMultiBalances(address owner, address[] calldata tokens) external view returns (uint256[] memory balances) {
        uint256 len = tokens.length;
        balances = new uint256[](len);
        assembly {
            let offset := tokens.offset
            mstore(0x2c, shl(96, owner)) // Store the `owner` argument.
            mstore(0x0c, 0x70a08231000000000000000000000000)
            for { let i:=0 } lt(i, len) {i := add(i, 1)} {
                let token := calldataload(add(offset, mul(i, 0x20)))
                pop(staticcall(gas(), token, 0x1c, 0x24, add(balances, mul(add(i,1), 0x20)), 0x20))
            }
        }
    }

}
