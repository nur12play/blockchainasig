const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Attack", function () {
  it("Should drain the bank", async function () {
    const [owner, attacker] = await ethers.getSigners();

    const Bank = await ethers.getContractFactory("VulnerableBank");
    const bank = await Bank.deploy();

    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.connect(attacker).deploy(bank.target);

    // owner кладёт 5 ETH
    await bank.connect(owner).deposit({ value: ethers.parseEther("5") });

    // attacker кладёт 1 ETH и атакует
    await attack.connect(attacker).attack({ value: ethers.parseEther("1") });

    expect(await ethers.provider.getBalance(bank.target)).to.equal(0);
  });
});
