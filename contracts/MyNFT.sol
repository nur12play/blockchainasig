// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 public nextId;

    constructor() ERC721("My Assignment NFT", "MAN") Ownable(msg.sender) {}

    function mint(address to, string memory uri) external onlyOwner returns (uint256) {
        uint256 id = nextId;
        nextId++;
        _safeMint(to, id);
        _setTokenURI(id, uri);
        return id;
    }
}
