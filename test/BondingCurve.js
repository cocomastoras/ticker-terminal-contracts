const {
  time,
  loadFixture,
    reset
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const {TOKEN_ABI, BC_ABI, tickers} = require("./constants.js")

describe("BondingCurve", function () {

  async function forkMainnetAndDeployFactory() {
    await reset('https://rpc.hyperliquid.xyz/evm', 4034912)
    const SPOT_PX_PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000000808";
    // 1. Deploy an instance of `SpotMock` as you would any other contract.
    const SpotMock = await hre.ethers.getContractFactory("Spot_Precompile");
    const spotMock = await SpotMock.deploy();
    // 2. Cache the bytecode that was just deployed.
    const code = await hre.ethers.provider.getCode(await spotMock.getAddress())
    // 3. Use `hardhat_setCode` to set the bytecode at `SPOT_PX_PRECOMPILE_ADDRESS`
    await hre.ethers.provider.send("hardhat_setCode", [SPOT_PX_PRECOMPILE_ADDRESS, code]);
    const signer = new ethers.Wallet('', await ethers.provider)
    const signers = await ethers.getSigners();
    await signers[18].sendTransaction({to: await signer.getAddress(), value: ethers.parseEther('10')})
    const admin = await signers[18].getAddress()
    const feeSink = await signers[19].getAddress()
    for(let i =0; i<215; i++) {
      await signer.sendTransaction({to: await signer.getAddress(), value: ethers.parseEther('1')})
    }
    const Factory = await ethers.getContractFactory("Factory");
    const len = tickers.length
    const initTickers = []
    let deployTickers = []
    if(len > 50) {
      for(let i=0; i<50;i++) {
        deployTickers.push(tickers[i])
      }
      for(let i=50;i<len;i++){
        initTickers.push((tickers[i]))
      }
    }else{
      deployTickers = tickers
    }
    const factory = await Factory.connect(signer).deploy(deployTickers, admin, admin, feeSink);
    if (len>50){
      await factory.connect(signers[18]).addNewCoreTickers(initTickers)
    }
    const Router = await ethers.getContractFactory("Router");
    const router = await Router.connect(signer).deploy();
    const wHype = await await ethers.getContractAt(TOKEN_ABI, '0x5555555555555555555555555555555555555555')

    let rsp = await factory.registerNewTicker("TEST NAME OF GODS LETS LIMIT", "TESTHL", "bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q")
    let receipt = await rsp.wait()
    const tokenAddress = receipt.logs[0]['args'][1]
    rsp = await factory.connect(signers[18]).initializeTickerMarket(tokenAddress)
    receipt = await rsp.wait()
    const token = await ethers.getContractAt(TOKEN_ABI, tokenAddress)
    const pairAddress = receipt.logs[0]['args'][1]
    const bondingCurve = await ethers.getContractAt(BC_ABI, pairAddress)
    return  { factory, router, wHype, token, bondingCurve};
  }

  describe("BondingCurve testing", function () {
    it("Test stage limits without withdrawing", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const admin = signers[18]
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})
        await bondingCurve.connect(admin).increaseTarget()
        const amountOut2 = await router.getAmountOut(tokenAddress, ethers.parseEther('3000'), true)
        await router.connect(signers[1]).buy(tokenAddress, amountOut2, {value: ethers.parseEther('3000')})
        await bondingCurve.connect(admin).increaseTarget()
        const amountOut3 = await router.getAmountOut(tokenAddress, ethers.parseEther('3000'), true)
        await router.connect(signers[2]).buy(tokenAddress, amountOut3, {value: ethers.parseEther('3000')})
        await bondingCurve.connect(admin).increaseTarget()
        const amountOut4 = await router.getAmountOut(tokenAddress, ethers.parseEther('2526'), true)
        await router.connect(signers[3]).buy(tokenAddress, amountOut4, {value: ethers.parseEther('2526')})
      }).timeout(1000000000000000);
    it("Test each stage limits", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const admin = signers[18]
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})
        await bondingCurve.connect(admin).withdrawHype()
        await bondingCurve.connect(admin).increaseTarget({value: ethers.parseEther('4440')})
        const amountOut2 = await router.getAmountOut(tokenAddress, ethers.parseEther('3000'), true)
        await router.connect(signers[1]).buy(tokenAddress, amountOut2, {value: ethers.parseEther('3000')})
        await bondingCurve.connect(admin).withdrawHype()
        await bondingCurve.connect(admin).increaseTarget({value: ethers.parseEther('6000')})
        const amountOut3 = await router.getAmountOut(tokenAddress, ethers.parseEther('3000'), true)
        await router.connect(signers[2]).buy(tokenAddress, amountOut3, {value: ethers.parseEther('3000')})
        await bondingCurve.connect(admin).withdrawHype()
        await bondingCurve.connect(admin).increaseTarget({value: ethers.parseEther('7500')})
        const amountOut4 = await router.getAmountOut(tokenAddress, ethers.parseEther('2526'), true)
        await router.connect(signers[3]).buy(tokenAddress, amountOut4, {value: ethers.parseEther('2526')})
      }).timeout(1000000000000000);
    it("Test cancel and migrate to AMM", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const admin = signers[18]
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})
        const txn = await bondingCurve.connect(admin).migrateToAmm()
        const receipt = await txn.wait()
      }).timeout(1000000000000000);
    describe("SwapBaseOut", function () {
      it("Should revert if not called from the Router", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const admin = signers[18]
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
        await expect(bondingCurve.connect(signers[0]).swapBaseOut(await signers[0].getAddress(), ethers.parseEther('5000'), amountOut, true)).revertedWithCustomError(bondingCurve, "InvalidCaller()")
      }).timeout(1000000000000000);
      it("Should revert if amount in or amount out is 0", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
        await expect(router.connect(signers[0]).buy(tokenAddress, amountOut)).revertedWithCustomError(router, "InvalidMaxAmountIn()")
        await expect(router.connect(signers[0]).buy(tokenAddress, 0, {value: ethers.parseEther('5000')})).revertedWithCustomError(bondingCurve, "InvalidInput()")
      }).timeout(1000000000000000);
      it("Should revert if token is bonded", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})
        await expect(router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})).revertedWithCustomError(bondingCurve, "TokenBonded()")
      }).timeout(1000000000000000);
    });
    describe("SwapIn", function () {
      it("Should revert if slippage reached", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        const maxAmountIn = ethers.parseEther('500')
        const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await router.connect(signers[1]).buy(tokenAddress, amountOut, {value: maxAmountIn})
        await expect(router.connect(signers[0]).buy(tokenAddress, amountOut, {value: maxAmountIn})).revertedWithCustomError(bondingCurve, "SlippageReached()")
      }).timeout(1000000000000000);
    });
    describe("SwapOut", function () {
      it("Should revert if slippage reached", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        const maxAmountIn = ethers.parseEther('500')
        let amountOut = await router.getAmountOut(tokenAddress, 3n * maxAmountIn, true)
        await router.connect(signers[1]).buy(tokenAddress, amountOut, {value: 3n * maxAmountIn})
        amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: maxAmountIn})
        const signer0Balance = await token.balanceOf(await signers[0].getAddress())
        const signer1Balance = await token.balanceOf(await signers[1].getAddress())
        amountOut = await router.getAmountOut(tokenAddress, signer0Balance, false)
        const amountOut1 = await router.getAmountOut(tokenAddress, signer1Balance/3n, false)
        await token.connect(signers[1]).transferAndCall(signer1Balance/3n, amountOut1)
        await expect(token.connect(signers[0]).transferAndCall(signer0Balance, amountOut)).revertedWithCustomError(bondingCurve, "SlippageReached()")
      }).timeout(1000000000000000);
      it("Should revert if no reserves", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        const maxAmountIn = ethers.parseEther('500')
        let amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await router.connect(signers[1]).buy(tokenAddress, amountOut, {value: maxAmountIn})
        amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: maxAmountIn})
        const signer0Balance = await token.balanceOf(await signers[0].getAddress())
        const signer1Balance = await token.balanceOf(await signers[1].getAddress())
        amountOut = await router.getAmountOut(tokenAddress, signer0Balance, false)
        const amountOut1 = await router.getAmountOut(tokenAddress, signer1Balance, false)
        await token.connect(signers[1]).transferAndCall(signer1Balance, amountOut1)
        await expect(token.connect(signers[0]).transferAndCall(signer0Balance, amountOut)).revertedWithCustomError(bondingCurve, "NotEnoughReserves()")
      }).timeout(1000000000000000);
    });
    describe("Admin", function () {
      it("Withdraw hype should revert not called by admin", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        await expect(bondingCurve.connect(signers[18]).withdrawHype()).revertedWithCustomError(bondingCurve, "InvalidState()")
      }).timeout(1000000000000000);
      it("Withdraw usdt should revert if not valid state", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        await expect(bondingCurve.connect(signers[18]).withdrawHype()).revertedWithCustomError(bondingCurve, "InvalidState()")
      }).timeout(1000000000000000);
    });
  });
});