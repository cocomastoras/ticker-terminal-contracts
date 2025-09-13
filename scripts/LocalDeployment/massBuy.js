const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
  const signers = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractAt('Factory', '0xCB81E0D1fE3C1820B178002E4c4AE0305FC82606', owner)
  const router = await hre.ethers.getContractAt('Router', '0xBE6Eb148D1c975D60Af3c1406c44e694720ED3a8', owner)
  const tokens = [
    "0x01630016e8285a62D4246Ad1A7139ED7266A3Dce",
    "0x267229C25468bB4Ca87D4eBb73BE0FCA49950FF7",
    "0x8F3038773F2129f797a73FA9ff2731637571d98d",
  ];

  const accounts = [
    { signer: signers[0], token: tokens[0] },
    { signer: signers[1], token: tokens[1] },
    { signer: signers[2], token: tokens[2] },
  ]
  const accounts2 = [
    { signer: signers[3], token: tokens[0] },
    { signer: signers[4], token: tokens[1] },
    { signer: signers[5], token: tokens[2] }
  ];

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getRandomAmount(min = 1, max = 300) {
    return ethers.parseEther((Math.random() * (max - min) + min).toFixed(2));
  }
  let i =0;
  while(true) {
    let action = Math.random() < 0.5 ? "buy" : "sell";
    // const amount = ethers.parseEther('5000')
    const txns = []
    console.log(i%2)
    if (i % 2 === 0) {
      for(let j =0; j<3; j++) {
        const tokenContract = await hre.ethers.getContractAt("BondingERC20", accounts[j].token);
        if (action === "buy") {
          const amount = getRandomAmount();
          const amountOut = await router.getAmountOut(tokenAddress, amount, true)
          try {
            const txn = await router.connect(accounts[j].signer).buy(accounts[j].token, amountOut*90n/100n, {value: amount});
            txns.push(txn)
          } catch (e) {

          }
        } else {
          if (await tokenContract.balanceOf(await accounts[j].signer.getAddress()) > 0) {
            const maxAmountIn = (await tokenContract.balanceOf(await accounts[j].signer.getAddress())) / 20n;
            const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
            try {
              const txn = await tokenContract.connect(accounts[j].signer).transferAndCall(maxAmountIn, amountOut*90n/100n);
              txns.push(txn)
            } catch (e) {

            }
          }
        }
      }
      console.log("Accounts 0 Batch executed in single block:");
      for (const tx of txns) {
        await tx.wait(0)
        console.log(`Tx: ${tx.hash}`);
      }
    } else {
      if (i===1) {
        action = "buy"
      }
      for(let j =0; j<3; j++) {
        const tokenContract = await hre.ethers.getContractAt("BondingERC20", accounts2[j].token);
        if (action === "buy") {
          const amount = getRandomAmount();
          const amountOut = await router.getAmountOut(tokenAddress, amount, true)
          try {
            const txn = await router.connect(accounts2[j].signer).buy(accounts2[j].token, amountOut*90n/100n, {value: amount});
            txns.push(txn)
          } catch (e) {

          }
        } else {
          if (await tokenContract.balanceOf(await accounts2[j].signer.getAddress()) > 0) {
            const maxAmountIn = (await tokenContract.balanceOf(await accounts2[j].signer.getAddress())) / 20n;
            const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
            try {
              const txn = await tokenContract.connect(accounts2[j].signer).transferAndCall(maxAmountIn, amountOut*90n/100n);
              txns.push(txn)

            } catch (e) {

            }
          }
        }
      }
      console.log("Accounts 1 Batch executed in single block:");
      for (const tx of txns) {
        await tx.wait(0)
        console.log(`Tx: ${tx.hash}`);
      }
    }
    await sleep(2000); // sleeps for 2 seconds
    i++
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});