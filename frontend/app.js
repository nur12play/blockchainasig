import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.16.0/+esm";


const TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 
const NFT_ADDRESS   = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// Hardhat Local (31337 = 0x7A69)
const HARDHAT_CHAIN_ID_HEX = "0x7A69";
const HARDHAT_PARAMS = {
  chainId: HARDHAT_CHAIN_ID_HEX,
  chainName: "Hardhat Local",
  rpcUrls: ["http://127.0.0.1:8545"],
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
];

const ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenURI(uint256) view returns (string)",
  "function nextId() view returns (uint256)",
];

const $ = (id) => document.getElementById(id);

let provider, signer, userAddress, token, nft, tokenDecimals = 18;

async function ensureHardhatNetwork() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [HARDHAT_PARAMS],
      });
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
    } else {
      throw err;
    }
  }
}

async function refreshTokenInfo() {
  const [name, symbol, dec] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
  ]);
  tokenDecimals = Number(dec);

  if ($("tokenInfo")) $("tokenInfo").textContent = `${name} (${symbol})`;
}

async function refreshBalance() {
  const bal = await token.balanceOf(userAddress);
  $("balance").innerText = ethers.formatUnits(bal, tokenDecimals);
}

async function refreshNFTSummary() {
  if (!$("nftInfo")) return;
  const [nName, nSym, next] = await Promise.all([nft.name(), nft.symbol(), nft.nextId()]);
  $("nftInfo").textContent = `${nName} (${nSym}), minted: ${next.toString()} tokens (0..${(next - 1n).toString()})`;
}

async function connect() {
  try {
    await ensureHardhatNetwork();

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    $("wallet").innerText = userAddress;

    token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
    nft   = new ethers.Contract(NFT_ADDRESS, ERC721_ABI, signer);

    await refreshTokenInfo();
    await refreshBalance();
    await refreshNFTSummary();

    console.log("Connected:", userAddress);
  } catch (e) {
    console.error("CONNECT ERROR:", e);
    alert("Ошибка подключения: " + (e?.message || e));
  }
}

async function sendTokens() {
  try {
    if (!token || !signer) return alert("Сначала нажми Connect MetaMask");

    const to = $("to").value.trim();
    const amt = $("amount").value.trim();

    if (!ethers.isAddress(to)) return alert("Неверный адрес получателя (0x...)");
    if (!amt) return alert("Введи Amount (например 1)");

    const value = ethers.parseUnits(amt, tokenDecimals);

    const tx = await token.transfer(to, value);

    if ($("txHash")) $("txHash").innerText = tx.hash;

    await tx.wait();
    await refreshBalance();

    alert("Transfer done ");
  } catch (e) {
    console.error("TRANSFER ERROR:", e);
    alert("Ошибка transfer: " + (e?.shortMessage || e?.message || e));
  }
}

async function checkNFT() {
  try {
    if (!nft || !signer) return alert("Сначала нажми Connect MetaMask");

    const idStr = $("tokenId").value.trim();
    if (!idStr) return alert("Введи Token ID (например 0)");

    const id = BigInt(idStr);

    const owner = await nft.ownerOf(id);
    const uri   = await nft.tokenURI(id);

    $("owner").innerText = owner;
    $("uri").innerText = uri;

  } catch (e) {
    console.error("NFT ERROR:", e);
    alert("Ошибка NFT: " + (e?.shortMessage || e?.message || e));
  }
}

$("connect").onclick = connect;
$("send").onclick = sendTokens;
$("check").onclick = checkNFT;

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => location.reload());
  window.ethereum.on("chainChanged", () => location.reload());
}
