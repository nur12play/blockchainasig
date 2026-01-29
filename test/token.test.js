const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken (ERC-20)", function () {
  async function deploy() {
    const [owner, alice, bob] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy();
    await token.waitForDeployment();
    return { token, owner, alice, bob };
  }

  it("Minting: owner can mint, non-owner cannot", async function () {
    const { token, owner, alice } = await deploy();

    await expect(token.mint(owner.address, ethers.parseUnits("1000", 18)))
      .to.emit(token, "Transfer");

    await expect(token.connect(alice).mint(alice.address, 1n)).to.be.reverted;
  });

  it("Transfers: transfer moves balances", async function () {
    const { token, owner, alice } = await deploy();

    await token.mint(owner.address, ethers.parseUnits("100", 18));
    await token.transfer(alice.address, ethers.parseUnits("25", 18));

    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseUnits("25", 18));
  });

  it("Approval & allowance: approve sets allowance", async function () {
    const { token, owner, alice } = await deploy();

    await token.mint(owner.address, ethers.parseUnits("100", 18));
    await token.approve(alice.address, ethers.parseUnits("10", 18));

    expect(await token.allowance(owner.address, alice.address)).to.equal(ethers.parseUnits("10", 18));
  });

  it("transferFrom: spender can transfer within allowance", async function () {
    const { token, owner, alice, bob } = await deploy();

    await token.mint(alice.address, ethers.parseUnits("50", 18));
    await token.connect(alice).approve(owner.address, ethers.parseUnits("20", 18));

    await token.transferFrom(alice.address, bob.address, ethers.parseUnits("20", 18));

    expect(await token.balanceOf(bob.address)).to.equal(ethers.parseUnits("20", 18));
    expect(await token.allowance(alice.address, owner.address)).to.equal(0n);
  });

  it("Reverts: transfer without balance should revert", async function () {
    const { token, alice, bob } = await deploy();

    await expect(token.connect(alice).transfer(bob.address, 1n)).to.be.reverted;
  });

  it("Reverts: transferFrom without approval should revert", async function () {
    const { token, alice, bob } = await deploy();

    await token.mint(alice.address, ethers.parseUnits("10", 18));
    await expect(token.transferFrom(alice.address, bob.address, 1n)).to.be.reverted;
  });
});
