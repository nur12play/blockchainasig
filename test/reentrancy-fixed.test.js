const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Fix", function () {
  it("Exploit should fail (revert) and bank funds stay safe", async function () {
    const [owner, attacker] = await ethers.getSigners();

    const Bank = await ethers.getContractFactory("SafeBank");
    const bank = await Bank.deploy();

    const Attack = await ethers.getContractFactory("AttackSafe");
    const attack = await Attack.connect(attacker).deploy(bank.target);

    // owner deposits 5 ETH
    await bank.connect(owner).deposit({ value: ethers.parseEther("5") });

    // attacker tries to attack with 1 ETH -> should revert ("Transfer failed")
    await expect(
      attack.connect(attacker).attack({ value: ethers.parseEther("1") })
    ).to.be.revertedWith("Transfer failed");

    // bank still has 5 ETH (attacker tx reverted, so his deposit didn't stick)
    const bankBal = await ethers.provider.getBalance(bank.target);
    expect(bankBal).to.equal(ethers.parseEther("5"));
  });
});
