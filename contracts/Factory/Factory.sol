// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {BondingERC20} from "../BondingErc20/BondingERC20.sol";
import {BondingCurve} from "../BondingCurve/BondingCurve.sol";

contract Factory {
    event NewToken(address indexed Creator, address indexed Token);
    event NewPair(address indexed Token, address indexed Pair);
    event TokenBonded(address indexed Token, address indexed Pair);
    event TokenRegistered(address indexed Token);
    event TokenMigrated(address indexed Token, address indexed Pair);

    error InvalidTicker();
    error InvalidCaller();
    error PairInitialized();
    error Frozen();

    mapping(address => address) private tokenToPair;
    mapping(address => address) private pairToToken;
    mapping(string => bool) public tickerAuctioned;
    mapping(bytes1 => bytes1) internal formatChar;
    mapping(bytes1 => bool) internal needsFormat;

    uint256[4] private stageToTokenLimit = [
        uint256(869565300 * 10**18), //4440 Hype
        uint256(30524800 * 10**18), //6000 Hype
        uint256(18352300 * 10**18), //7500 Hype
        uint256(19116290 * 10**18) //10000 Hype
    ];

    uint256[4] private stageToNativeLimit = [
        uint256(4440 * 10**18), //4440 Hype
        uint256(6000 * 10**18), //6000 Hype
        uint256(7500 * 10**18), //7500 Hype
        uint256(10000 * 10**18) //10000 Hype
    ];

    uint256 private isFrozen;
    address private admin;
    address private bcAdmin;
    address private feeSink;

    constructor(string[] memory tickers, address bcAdmin_, address factoryAdmin_, address feeSink_) {
        for(uint i=0; i<tickers.length;i++){
            tickerAuctioned[tickers[i]] = true;
        }
        formatChar['q'] = 'Q';
        formatChar['w'] = 'W';
        formatChar['e'] = 'E';
        formatChar['r'] = 'R';
        formatChar['t'] = 'T';
        formatChar['y'] = 'Y';
        formatChar['u'] = 'U';
        formatChar['i'] = 'I';
        formatChar['o'] = 'O';
        formatChar['p'] = 'P';
        formatChar['a'] = 'A';
        formatChar['s'] = 'S';
        formatChar['d'] = 'D';
        formatChar['f'] = 'F';
        formatChar['g'] = 'G';
        formatChar['h'] = 'H';
        formatChar['j'] = 'J';
        formatChar['k'] = 'K';
        formatChar['l'] = 'L';
        formatChar['z'] = 'Z';
        formatChar['x'] = 'X';
        formatChar['c'] = 'C';
        formatChar['v'] = 'V';
        formatChar['b'] = 'B';
        formatChar['n'] = 'N';
        formatChar['m'] = 'M';

        needsFormat['q'] = true;
        needsFormat['w'] = true;
        needsFormat['e'] = true;
        needsFormat['r'] = true;
        needsFormat['t'] = true;
        needsFormat['y'] = true;
        needsFormat['u'] = true;
        needsFormat['i'] = true;
        needsFormat['o'] = true;
        needsFormat['p'] = true;
        needsFormat['a'] = true;
        needsFormat['s'] = true;
        needsFormat['d'] = true;
        needsFormat['f'] = true;
        needsFormat['g'] = true;
        needsFormat['h'] = true;
        needsFormat['j'] = true;
        needsFormat['k'] = true;
        needsFormat['l'] = true;
        needsFormat['z'] = true;
        needsFormat['x'] = true;
        needsFormat['c'] = true;
        needsFormat['v'] = true;
        needsFormat['b'] = true;
        needsFormat['n'] = true;
        needsFormat['m'] = true;
        admin = factoryAdmin_;
        bcAdmin = bcAdmin_;
        feeSink = feeSink_;
    }

    function registerNewTicker(string memory name, string memory symbol, string memory uri) external {
        if (isFrozen != 0) {
            revert Frozen();
        }
        uint256 len =  bytes(symbol).length;
        for(uint i=0; i< len; i++){
            if(needsFormat[bytes(symbol)[i]]) {
                bytes(symbol)[i] = formatChar[bytes(symbol)[i]];
            }
        }
        if (tickerAuctioned[symbol] || len > 6 || bytes(name).length > 30){
            revert InvalidTicker();
        }
        BondingERC20 newToken = new BondingERC20(name, symbol, uri);
        emit NewToken(msg.sender, address(newToken));
    }

    function initializeTickerMarket(address token) external {
        if(msg.sender != admin) {
            revert InvalidCaller();
        }
        if (tokenToPair[token] != address(0)) {
            revert PairInitialized();
        }
        address payable newBondingCurve = payable(address(new BondingCurve()));
        emit NewPair(token, newBondingCurve);
        tokenToPair[token] = newBondingCurve;
        pairToToken[newBondingCurve] = token;
        BondingCurve(newBondingCurve).initialize(
            token,
            feeSink,
            bcAdmin,
            stageToTokenLimit[0],
            stageToNativeLimit[0]
        );
        BondingERC20(token).setBondingCurve(newBondingCurve);
    }

    function setLoAndTwap(address token, address limit, address twap) external {
        if(msg.sender != admin) {
            revert InvalidCaller();
        }
        BondingERC20(token).setLoAndTwap(limit, twap);
    }

    function addNewCoreTickers(string[] memory tickers) external{
        if(msg.sender != admin) {
            revert InvalidCaller();
        }
        uint len = tickers.length;
        for(uint i=0; i<len;i++){
            tickerAuctioned[tickers[i]] = true;
        }
    }

    function updateFactoryAdmin(address newAdmin) external {
        if(msg.sender != admin) {
            revert InvalidCaller();
        }
        admin = newAdmin;
    }

    function updateBcAdmin(address newAdmin) external {
        if(msg.sender != admin) {
            revert InvalidCaller();
        }
        bcAdmin = newAdmin;
    }

    function updateBcFeeSink(address newFeeSink) external {
        if(msg.sender != admin) {
            revert InvalidCaller();
        }
        feeSink = newFeeSink;
    }

    function toggleFreezeFactory(uint256 toggle) external {
        if(msg.sender != admin) {
            revert InvalidCaller();
        }
        isFrozen = toggle;
    }

    function bondCompleted() external {
        address token = pairToToken[msg.sender];
        if(token == address(0)){
            revert InvalidCaller();
        }
        emit TokenBonded(token, msg.sender);
    }

    function tokenMigratedToAmm(address pairAddress_) external {
        address token = pairToToken[msg.sender];
        if(token == address(0)){
            revert InvalidCaller();
        }
        emit TokenMigrated(token, pairAddress_);
    }

    function updateTokensCoreInfo(address token, uint256 coreTokenId_) external {
        if(msg.sender != admin){
            revert InvalidCaller();
        }
        emit TokenRegistered(token);
        BondingERC20(token).updateCoreInfo(coreTokenId_);
    }

    function updateStageLimits(uint256[4] memory newTokenLimits, uint256[4] memory newNativeLimits) external {
        if(msg.sender != admin) {
            revert InvalidCaller();
        }
        stageToTokenLimit = newTokenLimits;
        stageToNativeLimit = newNativeLimits;
    }

    function getPairFromToken(address tokenAddress) external view returns (address) {
        return tokenToPair[tokenAddress];
    }

    function getTokenFromPair(address pairAddress) external view returns (address) {
        return pairToToken[pairAddress];
    }

    function getLimitsForStage(uint256 stage) external view returns(uint256, uint256) {
        return (stageToNativeLimit[stage], stageToTokenLimit[stage]);
    }
}
