// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import "solady/src/tokens/ERC20.sol";
import {BondingCurve} from "../BondingCurve/BondingCurve.sol";

contract BondingERC20 is ERC20 {
    error NotValidTransfer();
    error InvalidCaller();
    error TokenNotBondedYet();
    error CoreRegistered();
    error TokenIsERC20();

    address private constant ROUTER = 0x13B8474c77BE8767829Ac879EdA070730e753260;
    address private constant FACTORY = 0x46F4e976C10E289e5F896B20fF15C1C497f0E1F3;
    address private LIMIT_ORDER = address(1);
    address private TWAP = address(1);

    string private name_;
    string private symbol_;
    string private uri_;
    address private bondingCurve;
    uint256 private deployedBlock;
    uint256 private deployedTimestamp;
    uint256 private coreTokenId;
    address private ammAddress;
    uint256 private isStandard = 0;

    constructor(string memory _name, string memory _symbol, string memory _uri){
        name_ = _name;
        symbol_ = _symbol;
        uri_ = _uri;
    }

    /// @dev Returns the name of the token.
    function name() public view virtual override returns (string memory) {
        return name_;
    }

    /// @dev Returns the symbol of the token.
    function symbol() public view virtual override returns (string memory) {
        return symbol_;
    }

    /// @dev Returns the uri of the token
    function uri() public view returns (string memory) {
        return uri_;
    }

    function transferAndCall(uint256 amount, uint256 amountOut) external returns(bool) {
        if(isStandard == 0){
            transfer(ROUTER, amount);
            bytes memory data = new bytes(100);
            assembly {
                let dataLocation := data
                mstore(add(dataLocation,0x20), 0xcae270b600000000000000000000000000000000000000000000000000000000)
                mstore(add(dataLocation,0x30), shl(96, address()))
                mstore(add(dataLocation,0x44), caller())
                mstore(add(dataLocation,0x64), amountOut)
                if iszero(
                    and(
                        eq(mload(0x00), 1),
                        call(gas(), ROUTER, 0, add(data,0x20), mload(data), 0, 0x20)
                    )
                ) {
                    revert(0x00, 0x04)
                }
            }
            return true;
        }
        revert TokenIsERC20();
    }

    function _beforeTokenTransfer(address, address to, uint256) internal virtual override {
        if(isStandard == 0) {
            if(
                (msg.sender != FACTORY) &&
                (msg.sender != ROUTER) &&
                (msg.sender != bondingCurve) &&
                (msg.sender != TWAP) &&
                (msg.sender != LIMIT_ORDER)  &&
                (to != TWAP) &&
                (to != LIMIT_ORDER) &&
                (to != ROUTER)
            ){
                revert NotValidTransfer();
            }
        }
    }

    function setBondingCurve(address bc_) external {
        if(msg.sender != FACTORY) {
            revert InvalidCaller();
        }
        bondingCurve = bc_;
        deployedBlock = block.number;
        deployedTimestamp = block.timestamp;
        _mint(bc_, 1000000000 * 10**18);
    }

    function setLoAndTwap(address limit, address twap) external {
        if(msg.sender != FACTORY) {
            revert InvalidCaller();
        }
        LIMIT_ORDER = limit;
        TWAP = twap;
    }

    function updateCoreInfo(uint256 coreTokenId_) external {
        if(msg.sender != FACTORY) {
            revert InvalidCaller();
        }
        if (BondingCurve(payable(bondingCurve)).isBonded() != 1) {
            revert TokenNotBondedYet();
        }
        if (coreTokenId != 0) {
            revert CoreRegistered();
        }
        coreTokenId = coreTokenId_;
    }

    function makeItStandardErc20(address ammAddress_) external {
        require(msg.sender == bondingCurve);
        isStandard = 1;
        ammAddress = ammAddress_;
    }

    function getTokenInfo() external view returns(string memory, string memory, string memory, uint256, address, uint256, uint256, uint256, address) {
        uint256 bondedBlock;
        address payable bonding_curve = payable(bondingCurve);
        if(bondingCurve != address(0)) {
            bondedBlock = BondingCurve(bonding_curve).bondedBlock();
        }
        return (name_, symbol_, uri_, coreTokenId, bonding_curve, deployedBlock, deployedTimestamp, bondedBlock, ammAddress);
    }
}
