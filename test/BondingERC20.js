const {
  time,
  loadFixture,
    reset
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const {TOKEN_ABI, BC_ABI, tickers} = require("./constants.js")

describe("BondingERC20", function () {

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
    await signers[18].sendTransaction({to: await signer.getAddress(), value: ethers.parseEther('100')})
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
    return  { factory, router, wHype, token, bondingCurve };
  }

  describe("BondingERC20 testing", function () {
    it("Should revert on transferAndCall when not valid data are passed", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const tokenAddress = await token.getAddress()
      let amountOut = await router.connect(signers[0]).getAmountOut(tokenAddress, ethers.parseEther('50'), true)
      const swapTxn = await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('50')})
      let receipt = await swapTxn.wait()
      const tokenBalance = receipt.logs[receipt.logs.length - 1]['args'][4]
      await expect(token.connect(signers[0]).transferAndCall(tokenBalance, 0)).revertedWithCustomError(router, 'InvalidInput()')
    }).timeout(1000000000000000);
    it("Should update token and native balance on transferAndCall", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const tokenAddress = await token.getAddress()
      let amountOut = await router.connect(signers[0]).getAmountOut(tokenAddress, ethers.parseEther('500'), true)
      const swapTxn = await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('500')})
      let receipt = await swapTxn.wait()
      const tokenBalance = receipt.logs[receipt.logs.length - 1]['args'][4]
      amountOut = await router.connect(signers[0]).getAmountOut(tokenAddress, tokenBalance/2n, false)
      await token.connect(signers[0]).transferAndCall(tokenBalance/2n, amountOut)
      expect(await token.balanceOf(await signers[0].getAddress())).to.be.lessThan(tokenBalance)
      expect(await ethers.provider.getBalance(await signers[0].getAddress())).to.be.greaterThan(9500n)
    }).timeout(1000000000000000);
    it("Should revert on setBondingCurve if caller is not factory", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const tokenAddress = await token.getAddress()
      await expect(token.connect(signers[0]).setBondingCurve(tokenAddress)).revertedWithCustomError(token, 'InvalidCaller()')
    }).timeout(1000000000000000);
    it("Should revert on updateCoreInfo if token already registered", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const admin = signers[18]
      const tokenAddress = await token.getAddress()
      const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
      await router.connect(admin).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})
      await factory.connect(admin).updateTokensCoreInfo(tokenAddress, 1)
      await expect(factory.connect(admin).updateTokensCoreInfo(tokenAddress, 1)).revertedWithCustomError(token, 'CoreRegistered()')
    }).timeout(1000000000000000);
    it("Should revert on updateCoreInfo if token not bonded yet", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const admin = signers[18]
      const tokenAddress = await token.getAddress()
      await expect(factory.connect(admin).updateTokensCoreInfo(tokenAddress, 1)).revertedWithCustomError(token, 'TokenNotBondedYet()')
    }).timeout(1000000000000000);
    it("Should return data on getTokenInfo", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const tokenAddress = await token.getAddress()
      console.log(await token.getTokenInfo())
    }).timeout(1000000000000000);
    it("Should revert on setLoAndTwap if caller is not factory", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const tokenAddress = await token.getAddress()
      await expect(token.connect(signers[0]).setLoAndTwap(tokenAddress, tokenAddress)).revertedWithCustomError(token, 'InvalidCaller()')
    }).timeout(1000000000000000);
    it("Should set setLoAndTwap if caller is factory", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const tokenAddress = await token.getAddress()
      await factory.connect(signers[18]).setLoAndTwap(tokenAddress, await signers[6].getAddress(), await signers[7].getAddress())
      const maxAmountIn = ethers.parseEther('500')
      const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
      await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: maxAmountIn})
      await token.connect(signers[0]).transfer(await signers[6].getAddress(), 100*10**6)
      await token.connect(signers[6]).transfer(await signers[5].getAddress(), 20*10**6)
      await token.connect(signers[0]).transfer(await signers[7].getAddress(), 100*10**6)
      await token.connect(signers[7]).transfer(await signers[5].getAddress(), 20*10**6)
      await expect(token.connect(signers[0]).transfer(await signers[3].getAddress(), 20*10**6)).revertedWithCustomError(token, 'NotValidTransfer()')
    }).timeout(1000000000000000);
  });
});