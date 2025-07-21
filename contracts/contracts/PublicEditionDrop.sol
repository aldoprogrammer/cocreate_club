// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC1155LazyMint.sol";

contract PublicEditionDrop is ERC1155LazyMint {
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    ) ERC1155LazyMint(
        _defaultAdmin,
        _name,
        _symbol,
        _royaltyRecipient,
        _royaltyBps
    ) {}

    // Siapa saja bisa lazyMint NFT baru
    function _canLazyMint() internal pure override returns (bool) {
        return true;
    }
}
