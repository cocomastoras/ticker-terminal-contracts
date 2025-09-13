// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

interface IBERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint256 result);
}
