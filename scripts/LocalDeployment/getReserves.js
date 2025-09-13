// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
require("@nomiclabs/hardhat-web3");

const hre = require("hardhat");
const ethers = require("ethers");
const {
  time, reset
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {TOKEN_ABI, BC_ABI} = require("../../test/constants.js")

async function main() {
  const owner = new ethers.Wallet('', await hre.ethers.provider)
   const tokens = [
    "0x01630016e8285a62D4246Ad1A7139ED7266A3Dce",
    "0x267229C25468bB4Ca87D4eBb73BE0FCA49950FF7",
    "0x8F3038773F2129f797a73FA9ff2731637571d98d",
  ];
   for(let i=0; i<tokens.length;i++) {
     const token = await hre.ethers.getContractAt("BondingERC20", tokens[i])
     console.log(await token.getTokenInfo())
  }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
