// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArticleNFT is ERC721URIStorage, Ownable {
  string public constant _name = "decentraStack";
  string public constant _symbol = "DSTK";
  string private _baseURIextended;

  constructor() ERC721(_name, _symbol) {
    // TODO deploy script to call `setBaseURI` instead of constructor
    _baseURIextended = "https://ipfs.io/ipfs/";
  }

  function setBaseURI(string memory baseURI_) external onlyOwner() {
    _baseURIextended = baseURI_;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseURIextended;
  }

  function createCollectible(address _author, string memory _title, string memory _contentIpfsHash) public returns (uint256) {
    uint256 newArticleId = uint256(keccak256(abi.encodePacked(_author, _title, _contentIpfsHash, block.timestamp)));
    _safeMint(_author, newArticleId);
    // calls ERC721URIStorage with `_contentIpfsHash` as the `tokenURI`
    _setTokenURI(newArticleId, _contentIpfsHash);
    return newArticleId;
  }
}