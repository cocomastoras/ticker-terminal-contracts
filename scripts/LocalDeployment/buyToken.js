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
  const signers = await hre.ethers.getSigners()
  const owner = new ethers.Wallet('', await hre.ethers.provider)
  const ownerAddress = await owner.getAddress()
  const factory = await hre.ethers.getContractAt('Factory', '0xCB81E0D1fE3C1820B178002E4c4AE0305FC82606', owner)
  const router = await hre.ethers.getContractAt('Router', '0xBE6Eb148D1c975D60Af3c1406c44e694720ED3a8', owner)
  //PASS THE TOKEN ADDRESS
  //YOU CAN CHANGE THE AMOUNT IN, FOR FLOAT : 0.1, 1.5 WORKS FINE
  //THIS SHOULD TRIGGER THE WSS FOR SWAP
  //YOU CAN CHANGE THE SIGNER IN THE SWAP TXN FOR DIFFERENT USER INDEX 0-20
  const maxAmountIn = ethers.parseEther('100')
  // const tokenAddress = 'TOKEN ADDRESS HERE'
  const tokenAddress = '0x01630016e8285a62D4246Ad1A7139ED7266A3Dce'
  const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
  const swapTxn = await router.connect(signers[8]).buy(tokenAddress, amountOut, {value: maxAmountIn})
  const receipt = await swapTxn.wait()
  console.log(receipt.logs[receipt.logs.length - 1])
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
