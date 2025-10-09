// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IERC165 {
    function supportsInterface(bytes4 interfaceID)
        external
        view
        returns (bool);
}

interface IERC721 is IERC165 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId)
        external;
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId)
        external
        view
        returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

contract ERC721RES4 is IERC721 {
    event Transfer(
        address indexed from, address indexed to, uint256 indexed id
    );
    event Approval(
        address indexed owner, address indexed spender, uint256 indexed id
    );
    event ApprovalForAll(
        address indexed owner, address indexed operator, bool approved
    );

    struct Asset{
        uint256 assetId;
        uint256 price;
    }
    
    address public supervisor;

    // Mapping of token ID to asset data
    mapping(uint256 => Asset) public assetMap;

    //total count of assets
    uint256 public assetsCount;

    // Mapping from token ID to owner address
    mapping(uint256 => address) internal _assetOwner;

    // Mapping owner address to token count
    mapping(address => uint256) internal _ownedAssetsCount;

    // Mapping from token ID to approved address
    mapping(uint256 => address) internal _assetApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    constructor(){
        supervisor = msg.sender;
    }

    function supportsInterface(bytes4 interfaceId)
        external
        pure
        returns (bool)
    {
        return interfaceId == type(IERC721).interfaceId
            || interfaceId == type(IERC165).interfaceId;
    }

    function ownerOf(uint256 id) external view returns (address owner) {
        owner = _assetOwner[id];
        require(owner != address(0), "token doesn't exist");
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "owner = zero address");
        return _ownedAssetsCount[owner];
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function approve(address spender, uint256 id) external {
        address owner = _assetOwner[id];
        require(
            msg.sender == owner || isApprovedForAll[owner][msg.sender],
            "not authorized"
        );

        _assetApprovals[id] = spender;

        emit Approval(owner, spender, id);
    }

    function getApproved(uint256 id) external view returns (address) {
        require(_assetOwner[id] != address(0), "token doesn't exist");
        return _assetApprovals[id];
    }

    function _isApprovedOrOwner(address owner, address spender, uint256 id)
        internal
        view
        returns (bool)
    {
        return (
            spender == owner || isApprovedForAll[owner][spender]
                || spender == _assetApprovals[id]
        );
    }

    function transferFrom(address from, address to, uint256 id) public {
        require(from == _assetOwner[id], "from != owner");
        require(to != address(0), "transfer to zero address");

        require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");

        _ownedAssetsCount[from]--;
        _ownedAssetsCount[to]++;
        _assetOwner[id] = to;

        delete _assetApprovals[id];

        emit Transfer(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id) external {
        transferFrom(from, to, id);

        require(
            to.code.length == 0
                || IERC721Receiver(to).onERC721Received(msg.sender, from, id, "")
                    == IERC721Receiver.onERC721Received.selector,
            "unsafe recipient"
        );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        bytes calldata data
    ) external {
        transferFrom(from, to, id);

        require(
            to.code.length == 0
                || IERC721Receiver(to).onERC721Received(msg.sender, from, id, data)
                    == IERC721Receiver.onERC721Received.selector,
            "unsafe recipient"
        );
    }

    function _mint(address to, uint256 id) internal {
        require(to != address(0), "mint to zero address");
        require(_assetOwner[id] == address(0), "already minted");

        _ownedAssetsCount[to]++;
        _assetOwner[id] = to;

        emit Transfer(address(0), to, id);
    }
    ///our functions////
    function addAsset(uint256 price,address to) public{
        require(supervisor == msg.sender,'NotAManager');
        
        assetMap[assetsCount] = Asset(assetsCount,price);
        _mint(to,assetsCount);
        assetsCount = assetsCount+1;
    }

    function build(uint256 assetId,uint256 value) public payable{
        require(_assetOwner[assetId] == msg.sender, "Not token owner");
        Asset memory oldAsset = assetMap[assetId];
        assetMap[assetId] = Asset(oldAsset.assetId, oldAsset.price+value);
    }
    function appreciate(uint256 assetId,uint256 value) public{
        require(msg.sender==supervisor,"NotaManager");
        Asset memory oldAsset = assetMap[assetId];
        assetMap[assetId] = Asset(oldAsset.assetId, oldAsset.price+value);
    }
    function depreciate(uint256 assetId,uint256 value) public{
        require(msg.sender==supervisor,"NotaManager");
        Asset memory oldAsset = assetMap[assetId];
        assetMap[assetId] = Asset(oldAsset.assetId, oldAsset.price-value);
    }

    function clearApproval(uint256 id) external {
        address owner = _assetOwner[id];
        require(owner != address(0), "token doesn't exist");
        require(msg.sender == owner || isApprovedForAll[owner][msg.sender],"not authorized");

        _assetApprovals[id] = address(0);
        emit Approval(owner, address(0), id);
    }
}