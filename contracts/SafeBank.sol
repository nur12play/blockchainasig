// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SafeBank {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No balance");

        // ✅ FIX: effects first
        balances[msg.sender] = 0;

        // ✅ interactions after
        (bool ok,) = msg.sender.call{value: bal}("");
        require(ok, "Transfer failed");
    }
}
