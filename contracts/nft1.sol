// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT1 is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("DINO1", "D1") {
        mint(0x3Ec8BF370a398A5Cd3D9e4458030f34993ad65E9, 69);
    }

    function mint(address to, uint256 id) private returns (bool) {
        _safeMint(to, id);
        _setTokenURI(id, "blah");

        return true;
    }
}
