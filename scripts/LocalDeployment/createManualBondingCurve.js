// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
require("@nomiclabs/hardhat-web3");

const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
  const owner = new ethers.Wallet('', await hre.ethers.provider)
  const ownerAddress = await owner.getAddress()
  const factory = await hre.ethers.getContractAt('Factory', '0xCB81E0D1fE3C1820B178002E4c4AE0305FC82606', owner)
  const router = await hre.ethers.getContractAt('Router', '0xBE6Eb148D1c975D60Af3c1406c44e694720ED3a8', owner)
  //PASS THE TOKEN ADDRESS
  //THIS SHOULD TRIGGER THE WSS FOR NEW PAIR
    const tokens = [
    "0x01630016e8285a62D4246Ad1A7139ED7266A3Dce",
    "0x267229C25468bB4Ca87D4eBb73BE0FCA49950FF7",
    "0x8F3038773F2129f797a73FA9ff2731637571d98d",
    // "0x56c39174C84E24C3cD2A882eab799aC7e638f4fb"
  ];
  for(let i=0; i<tokens.length;i++) {
    const txn = await factory.connect(owner).initializeTickerMarket(tokens[i])
    const receipt = await txn.wait()
    console.log(receipt.logs)
  }
  // const tokenAddress = '0x8F3038773F2129f797a73FA9ff2731637571d98d'
  //
  // const txn = await factory.connect(owner).initializeTickerMarket(tokenAddress)
  // const receipt = await txn.wait()
  // console.log(receipt.logs)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
