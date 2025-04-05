// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract HashKeyKYC is Ownable {
    mapping(address => bool) private kycStatus;

    constructor() Ownable(msg.sender) {}

    function checkKYC(address _user) external view returns (bool) {
        return kycStatus[_user];
    }

    function setKYCStatus(address _user, bool _status) external onlyOwner {
        kycStatus[_user] = _status;
    }
}
