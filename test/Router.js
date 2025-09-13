const {
  time,
  loadFixture,
    reset
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const {TOKEN_ABI, BC_ABI, tickers} = require("./constants.js")

describe("Router", function () {

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

  describe("Router testing", function () {
    it("E2E test with 18 users interacting back and forth", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const admin = signers[18]
      const feeSink = signers[19]
      const tokenAddress = await token.getAddress()

      const accounts = Array.from({length: 18}, (_, i) => ({
        signer: signers[i],
        timesSelected: 0,
        actions: [],
        tokenBalance: 0n,
        hypeBought: 0n,
        hypeSold: 0n
      }));

      function getRandomAmount(min = 1, max = 100) {
        return (Math.random() * (max - min + 1)) + min;
      }

      function getRandomAccount() {
        const index = Math.floor(Math.random() * accounts.length);
        return accounts[index];
      }

      function getRandomAction() {
        const ran = Math.random()
        return ran < 0.7 ? "buy" : "sell";
      }

      while (await bondingCurve.isBonded() === 0n) {
        const account = getRandomAccount();
        let action;
        if (account.timesSelected === 0) {
          action = "buy";
        } else {
          action = getRandomAction();
        }
        if (action === "buy") {
          let maxAmountIn = getRandomAmount().toFixed(2).toString();
          maxAmountIn = ethers.parseEther(maxAmountIn)
          if (await ethers.provider.getBalance(await account.signer.getAddress()) < 101n * (10n ** 18n)) {
            action = "sell"
            maxAmountIn = account.tokenBalance / 20n
            const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
            const swapTxn = await token.connect(account.signer).transferAndCall(maxAmountIn, amountOut)
            const receipt = await swapTxn.wait()
            const eventData = receipt.logs[receipt.logs.length - 1]['data']
            const amountIn = ethers.getBigInt(eventData.slice(0, 66))
            const hypeBalance = ethers.getBigInt('0x' + eventData.slice(66, 130))
            account.timesSelected += 1;
            account.actions.push(action);
            account.tokenBalance -= amountIn;
            account.hypeSold += hypeBalance;
          } else {
            const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
            const swapTxn = await router.connect(account.signer).buy(tokenAddress, amountOut, {value: maxAmountIn})
            const receipt = await swapTxn.wait()
            const tokenBalance = receipt.logs[receipt.logs.length - 1]['args'][4]
            const amountIn = receipt.logs[receipt.logs.length - 1]['args'][3]
            account.actions.push(action);
            account.tokenBalance += tokenBalance;
            account.hypeBought += amountIn;
            account.timesSelected += 1;
          }
        } else {
          const maxAmountIn = account.tokenBalance / 10n
          const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
          const swapTxn = await token.connect(account.signer).transferAndCall(maxAmountIn, amountOut)
          const receipt = await swapTxn.wait()
          const eventData = receipt.logs[receipt.logs.length - 1]['data']
          const amountIn = ethers.getBigInt(eventData.slice(0, 66))
          const hypeBalance = ethers.getBigInt('0x' + eventData.slice(66, 130))
          account.timesSelected += 1;
          account.actions.push(action);
          account.tokenBalance -= amountIn;
          account.hypeSold += hypeBalance;
        }
      }
      let totalVolume = 0n;
      for (let i = 0; i < accounts.length; i++) {
        expect(accounts[i].tokenBalance).to.eq(await token.balanceOf(await accounts[i].signer.getAddress()))
        totalVolume += accounts[i].hypeBought + accounts[i].hypeSold
        accounts[i].tokenBalance = ethers.formatEther(accounts[i].tokenBalance)
        accounts[i]['PnL'] = accounts[i].hypeBought > accounts[i].hypeSold ? "-" + (ethers.formatEther(accounts[i].hypeBought - accounts[i].hypeSold)).toString() : ethers.formatEther(accounts[i].hypeSold - accounts[i].hypeBought)
        accounts[i].hypeBought = ethers.formatEther(accounts[i].hypeBought)
        accounts[i].hypeSold = ethers.formatEther(accounts[i].hypeSold)
      }
      const [realReserves0, realReserves1, , virtualReserves1] = await bondingCurve.getReserves()
      expect(realReserves0).to.eq(0n)
      expect(await wHype.balanceOf(await bondingCurve.getAddress())).to.eq(4440n * 10n ** 18n)
      expect(await wHype.balanceOf(await feeSink.getAddress())).to.be.gt((totalVolume * 99n / 100n) / 100n)
      expect(realReserves0).eq(0n)
      expect(realReserves1).greaterThanOrEqual(4440n * 10n**18n)
      expect(virtualReserves1).greaterThanOrEqual((4440n + 666n) * 10n**18n)
    }).timeout(1000000000000000);
    it("E2E test with 18 users interacting back and forth with reinject liquidity", async function () {
      const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
      const signers = await ethers.getSigners()
      const admin = signers[18]
      const feeSink = signers[19]
      const tokenAddress = await token.getAddress()

      const accounts = Array.from({length: 18}, (_, i) => ({
        signer: signers[i],
        timesSelected: 0,
        actions: [],
        tokenBalance: 0n,
        hypeBought: 0n,
        hypeSold: 0n
      }));

      function getRandomAmount(min = 1, max = 100) {
        return (Math.random() * (max - min + 1)) + min;
      }

      function getRandomAccount() {
        const index = Math.floor(Math.random() * accounts.length);
        return accounts[index];
      }

      function getRandomAction() {
        const ran = Math.random()
        return ran < 0.7 ? "buy" : "sell";
      }
      const limits = [4440n, 6000n, 7500n, 10000n]

      for(let i=0; i<4;i++) {
        while (await bondingCurve.isBonded() === 0n) {
          const account = getRandomAccount();
          let action;
          if (account.timesSelected === 0) {
            action = "buy";
          } else {
            action = getRandomAction();
          }
          if (action === "buy") {
            let maxAmountIn = getRandomAmount().toFixed(2).toString();
            maxAmountIn = ethers.parseEther(maxAmountIn)
            if (await ethers.provider.getBalance(await account.signer.getAddress()) < 101n * (10n ** 18n)) {
              action = "sell"
              maxAmountIn = account.tokenBalance / (BigInt(i+2)*10n)
              const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
              const swapTxn = await token.connect(account.signer).transferAndCall(maxAmountIn, amountOut)
              const receipt = await swapTxn.wait()
              const eventData = receipt.logs[receipt.logs.length - 1]['data']
              const amountIn = ethers.getBigInt(eventData.slice(0, 66))
              const hypeBalance = ethers.getBigInt('0x' + eventData.slice(66, 130))
              account.timesSelected += 1;
              account.actions.push(action);
              account.tokenBalance -= amountIn;
              account.hypeSold += hypeBalance;
            } else {
              const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
              const swapTxn = await router.connect(account.signer).buy(tokenAddress, amountOut, {value: maxAmountIn})
              const receipt = await swapTxn.wait()
              const tokenBalance = receipt.logs[receipt.logs.length - 1]['args'][4]
              const amountIn = receipt.logs[receipt.logs.length - 1]['args'][3]
              account.actions.push(action);
              account.tokenBalance += tokenBalance;
              account.hypeBought += amountIn;
              account.timesSelected += 1;
            }
          } else {
            const maxAmountIn = account.tokenBalance / (BigInt(i+2)*10n)
            const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
            const swapTxn = await token.connect(account.signer).transferAndCall(maxAmountIn, amountOut)
            const receipt = await swapTxn.wait()
            const eventData = receipt.logs[receipt.logs.length - 1]['data']
            const amountIn = ethers.getBigInt(eventData.slice(0, 66))
            const hypeBalance = ethers.getBigInt('0x' + eventData.slice(66, 130))
            account.timesSelected += 1;
            account.actions.push(action);
            account.tokenBalance -= amountIn;
            account.hypeSold += hypeBalance;
          }
        }
        const [realReserves0, realReserves1, , virtualReserves1] = await bondingCurve.getReserves()
        expect(realReserves0).to.eq(0n)
        expect(await wHype.balanceOf(await bondingCurve.getAddress())).to.eq(limits[i] * 10n ** 18n)
        expect(realReserves1).greaterThanOrEqual(limits[i] * 10n**18n)
        expect(virtualReserves1).greaterThanOrEqual((limits[i] + 666n) * 10n**18n)
        await bondingCurve.connect(admin).withdrawHype()
        if(i < 3) {
          await bondingCurve.connect(admin).increaseTarget({value: limits[i] * 10n ** 18n})
        }
      }
      let totalVolume = 0n;
      for (let i = 0; i < accounts.length; i++) {
        expect(accounts[i].tokenBalance).to.eq(await token.balanceOf(await accounts[i].signer.getAddress()))
        totalVolume += accounts[i].hypeBought + accounts[i].hypeSold
        accounts[i].tokenBalance = ethers.formatEther(accounts[i].tokenBalance)
        accounts[i]['PnL'] = accounts[i].hypeBought > accounts[i].hypeSold ? "-" + (ethers.formatEther(accounts[i].hypeBought - accounts[i].hypeSold)).toString() : ethers.formatEther(accounts[i].hypeSold - accounts[i].hypeBought)
        accounts[i].hypeBought = ethers.formatEther(accounts[i].hypeBought)
        accounts[i].hypeSold = ethers.formatEther(accounts[i].hypeSold)
      }
      expect(await wHype.balanceOf(await feeSink.getAddress())).to.be.gt((totalVolume * 99n / 100n) / 100n)
    }).timeout(1000000000000000);
    describe("Buy", function () {
      it("Event should have the same reserves as getReserves", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const admin = signers[18]
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        const maxAmountIn = ethers.parseEther('500')
        const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        const txn = await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: maxAmountIn})
        const rsp = await txn.wait()
        const rsp_args = rsp.logs[rsp.logs.length - 1].args
        const reserves = await router.getReservesForTokenSingle(await token.getAddress())
        expect(rsp_args[5]).eq(reserves[0])
        expect(rsp_args[6]).eq(reserves[1])
        expect(rsp_args[7]).eq(reserves[2])
        expect(rsp_args[8]).eq(reserves[3])
        expect(rsp_args[9]).eq(reserves[4])
      }).timeout(1000000000000000);
      it("Should revert if maxAmountIn eq 0", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        const maxAmountIn = ethers.parseEther('500')
        const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await expect(router.connect(signers[0]).buy(tokenAddress, amountOut, {value: 0})).revertedWithCustomError(router, "InvalidMaxAmountIn()")
      }).timeout(1000000000000000);
      it("Should revert if not valid token", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        const maxAmountIn = ethers.parseEther('500')
        const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await expect(router.connect(signers[0]).buy(await signers[4].getAddress(), amountOut, {value: maxAmountIn})).revertedWithCustomError(router, "InvalidToken()")
      }).timeout(1000000000000000);
      it("Should send 1% to feeSink", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        const maxAmountIn = ethers.parseEther('100')
        const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: maxAmountIn})
        expect(await wHype.balanceOf(await feeSink.getAddress())).greaterThan(0n)
      }).timeout(1000000000000000);
    });
    describe("Sell", function () {
      it("Event should have the same reserves as getReserves", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const admin = signers[18]
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        let maxAmountIn = ethers.parseEther('100')
        let amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: maxAmountIn})
        maxAmountIn = await token.balanceOf(await signers[0].getAddress())
        amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
        const txn = await token.connect(signers[0]).transferAndCall(maxAmountIn, amountOut)
        const rsp = await txn.wait()
        const rsp_args = rsp.logs[rsp.logs.length - 1].args
        const reserves = await router.getReservesForTokenSingle(await token.getAddress())
        expect(rsp_args[5]).eq(reserves[0])
        expect(rsp_args[6]).eq(reserves[1])
        expect(rsp_args[7]).eq(reserves[2])
        expect(rsp_args[8]).eq(reserves[3])
        expect(rsp_args[9]).eq(reserves[4])
      }).timeout(1000000000000000);
      it("Should revert if maxAmountIn eq 0", async function () {
        const {router, token} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const tokenAddress = await token.getAddress()
        const maxAmountIn = ethers.parseEther('5000000')
        const amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
        await expect(token.transferAndCall(0, amountOut)).revertedWithCustomError(router, "InvalidMaxAmountIn()")
      }).timeout(1000000000000000);
      it("Should send 1% to feeSink", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        let maxAmountIn = ethers.parseEther('100')
        let amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, true)
        await router.connect(signers[0]).buy(tokenAddress, amountOut, {value: maxAmountIn})
        maxAmountIn = await token.balanceOf(await signers[0].getAddress())
        amountOut = await router.getAmountOut(tokenAddress, maxAmountIn, false)
        await token.connect(signers[0]).transferAndCall(maxAmountIn, amountOut)
        expect(await wHype.balanceOf(await feeSink.getAddress())).greaterThan(0n)
      }).timeout(1000000000000000);
    })
    describe("Views", function () {
      it("Should return reserves for given token", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const tokenAddress = await token.getAddress()
        const rsp = await router.getReservesForTokenSingle(tokenAddress)
        expect(rsp[0]).to.eq(869565300n * 10n**18n)
        expect(rsp[4]).to.eq(4440n*10n**18n)
      }).timeout(1000000000000000);
      it("Should return reserves for given tokens", async function () {
        const {factory, router, wHype, token, bondingCurve} = await loadFixture(forkMainnetAndDeployFactory);
        const signers = await ethers.getSigners()
        const feeSink = signers[19]
        const tokenAddress = await token.getAddress()
        const tokenAddresses = []
        tokenAddresses.push(tokenAddress)
        for (let i=0; i<10;i++){
          let rsp = await factory.registerNewTicker("TEST NAME OF GODS LETS LIMIT", i.toString(), "bafkreihwqhounu3cdwgvk2gc2dqcinpntlccbo3xcy4xuerd24yndldl5q")
          let receipt = await rsp.wait()
          tokenAddresses.push(receipt.logs[0]['args'][1])
          rsp = await factory.connect(signers[18]).initializeTickerMarket(receipt.logs[0]['args'][1])
          receipt = await rsp.wait()
        }
        const rsp = await router.getReservesForTokenMulti(tokenAddresses)
        for(let i=0; i< rsp.length; i++){
          expect(rsp[0][i]).eq(869565300n * 10n**18n)
        }
      }).timeout(1000000000000000);
    });
  });
});