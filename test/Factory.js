const {
  time,
  loadFixture,
    reset
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const {TOKEN_ABI, BC_ABI, tickers} = require("./constants.js")

describe("Factory", function () {

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
    return  { factory, router, wHype, token, bondingCurve };
  }

  describe("Factory testing", function () {
    it("Should Create a new ticker auction", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const txn = await factory.registerNewTicker('UNIT TEST 1/1', 'TOP.HL', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      const receipt = await txn.wait()
      const tokenAddress = receipt.logs[0]['args'][1]
      expect(txn).to.emit(factory, 'NewToken').withArgs(await signers[0].getAddress(), tokenAddress)
    }).timeout(1000000000000000);
    it("Should Initialize the ticker market", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const txn = await factory.registerNewTicker('UNIT TEST 1/1', 'TOP.HL', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      let receipt = await txn.wait()
      const tokenAddress = receipt.logs[0]['args'][1]
      const initTxn = await factory.connect(signers[18]).initializeTickerMarket(tokenAddress)
      receipt = await initTxn.wait()
      const token = await ethers.getContractAt(TOKEN_ABI, tokenAddress)
      const pairAddress = receipt.logs[0]['args'][1]
      expect(initTxn).to.emit(factory, 'NewPair').withArgs(tokenAddress, pairAddress)
    }).timeout(1000000000000000);
    it("Should revert if ticker registered or length greater than 6", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      await expect(factory.registerNewTicker('UNIT TEST 1/1', 'TEST', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')).revertedWithCustomError(factory, "InvalidTicker()")
      await expect(factory.registerNewTicker('UNIT TEST 1/1', 'TEST123', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')).revertedWithCustomError(factory, "InvalidTicker()")
    }).timeout(1000000000000000);
    it("Should format ticker if wrong case", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      let txn = await factory.registerNewTicker('UNIT TEST SAKA LAKA', 'asdfgh', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      let receipt = await txn.wait()
      let tokenAddress = receipt.logs[0]['args'][1]
      let token = await ethers.getContractAt(TOKEN_ABI, tokenAddress)
      expect(await token.symbol()).eq('ASDFGH')
      txn = await factory.registerNewTicker('HarryPotterHyperMarioLiquidFen', 'avbslk', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      receipt = await txn.wait()
      tokenAddress = receipt.logs[0]['args'][1]
      token = await ethers.getContractAt(TOKEN_ABI, tokenAddress)
      expect(await token.symbol()).eq('AVBSLK')
      txn = await factory.registerNewTicker('UNIT TEST SAKA LAKA', 'aKc0iP', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      receipt = await txn.wait()
      tokenAddress = receipt.logs[0]['args'][1]
      token = await ethers.getContractAt(TOKEN_ABI, tokenAddress)
      expect(await token.symbol()).eq('AKC0IP')
    }).timeout(1000000000000000);
    it("Should revert if caller is not admin on initialization", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const txn = await factory.registerNewTicker('UNIT TEST 1/1', 'TOP.HL', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      let receipt = await txn.wait()
      const tokenAddress = receipt.logs[0]['args'][1]
      await expect(factory.connect(signers[1]).initializeTickerMarket(tokenAddress)).revertedWithCustomError(factory, "InvalidCaller()")
    }).timeout(1000000000000000);
    it("Should revert if trying to initialize an already inited token", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const txn = await factory.connect(signers[0]).registerNewTicker('UNIT TEST 1/1', 'TOP.HL', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      let receipt = await txn.wait()
      const tokenAddress = receipt.logs[0]['args'][1]
      await factory.connect(signers[18]).initializeTickerMarket(tokenAddress)
      await expect(factory.connect(signers[18]).initializeTickerMarket(tokenAddress)).revertedWithCustomError(factory, "PairInitialized()")
    }).timeout(1000000000000000);
    it("Should emit TokenBonded event when a BC is completed", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const admin = signers[18]
      const feeSink = signers[19]
      const tokenAddress = await token.getAddress()
      const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
      await expect(router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})).to.emit(factory, "TokenBonded").withArgs(tokenAddress, await bondingCurve.getAddress())
    }).timeout(1000000000000000);
    it("Should revert on updateTokensCoreInfo if caller not admin", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const tokenAddress = await token.getAddress()
      const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
      await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})
      await expect(factory.connect(signers[0]).updateTokensCoreInfo(tokenAddress, 1)).revertedWithCustomError(factory, "InvalidCaller()")
    }).timeout(1000000000000000);
    it("should registering correct values on tokenToPair, pairToToken, totalPairs", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const txn = await factory.registerNewTicker('UNIT TEST 1/1', 'TOP.HL', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      let receipt = await txn.wait()
      const tokenAddress = receipt.logs[0]['args'][1]
      const initTxn = await factory.connect(signers[18]).initializeTickerMarket(tokenAddress)
      receipt = await initTxn.wait()
      const pairAddress = receipt.logs[0]['args'][1]
      expect(await factory.getPairFromToken(tokenAddress)).to.eq(pairAddress)
      expect(await factory.getTokenFromPair(pairAddress)).to.eq(tokenAddress)
    }).timeout(1000000000000000);
    it("Should work on updateTokensCoreInfo if conditions met", async function () {
     const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
     const signers = await ethers.getSigners()
     const admin = signers[18]
     const tokenAddress = await token.getAddress()
     const amountOut = await router.getAmountOut(tokenAddress, ethers.parseEther('5000'), true)
     await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: ethers.parseEther('5000')})
     await factory.connect(admin).updateTokensCoreInfo(tokenAddress, 1)
     console.log(await token.getTokenInfo())
   }).timeout(1000000000000000);
    it("Should revert on ticker register if contract frozen", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      await factory.connect(signers[18]).toggleFreezeFactory(1)
      await expect(factory.registerNewTicker('UNIT TEST 1/1', 'TEST', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')).revertedWithCustomError(factory, "Frozen()")
      await factory.connect(signers[18]).toggleFreezeFactory(0)
      await expect(factory.registerNewTicker('UNIT TEST 1/1', 'TEST123', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')).revertedWithCustomError(factory, "InvalidTicker()")
    }).timeout(1000000000000000);
    it("Should work if ticker duplicate", async function () {
      const {factory} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      await factory.registerNewTicker('UNIT TEST 1/1', 'OCD', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
      await factory.registerNewTicker('UNIT TEST 1/12', 'OCD', 'bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q')
    }).timeout(1000000000000000);
  });
});