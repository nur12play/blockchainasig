const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT (ERC-721)", function () {
  async function deploy() {
    const [owner, alice, bob] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("MyNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    return { nft, owner, alice, bob };
  }

  it("Mint: owner can mint 3 NFTs and tokenURI works", async function () {
    const { nft, alice } = await deploy();

    await nft.mint(alice.address, "ipfs://metadata-0.json");
    await nft.mint(alice.address, "ipfs://metadata-1.json");
    await nft.mint(alice.address, "ipfs://metadata-2.json");

    expect(await nft.ownerOf(0n)).to.equal(alice.address);
    expect(await nft.ownerOf(1n)).to.equal(alice.address);
    expect(await nft.ownerOf(2n)).to.equal(alice.address);

    expect(await nft.tokenURI(0n)).to.equal("ipfs://metadata-0.json");
    expect(await nft.tokenURI(2n)).to.equal("ipfs://metadata-2.json");
  });

  it("Ownership check: non-owner cannot mint", async function () {
    const { nft, alice } = await deploy();
    await expect(nft.connect(alice).mint(alice.address, "ipfs://x.json")).to.be.reverted;
  });
});
