// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Token.sol";

//import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
//import "@openzeppelin/contracts/access/AccessControl.sol";

contract Bridge  {
    using ECDSA for bytes32;
    uint256 chainId;
    mapping(address => address) tokens;
    mapping(address => bool) tokenAvailable;
    uint256 nonce;
    address validator;
    mapping(bytes32 => bool) public signatures;
    
    mapping(uint256=>bool)chains;
    constructor(uint256 _chainId,address _validator) {
        chainId=_chainId;
        validator= _validator;
        chains[chainId]=true;
    }
    function includeToken(address tokenFrom,address tokenTo) external{
        require(tokens[tokenTo]==address(0)&&tokenAvailable[tokenFrom]==false, "token exist");
        tokens[tokenTo]=tokenFrom;
        tokenAvailable[tokenFrom]=true;
    }
    function excludeToken(address tokenFrom,address tokenTo) external{
        require(tokens[tokenTo]!=address(0)&&tokenAvailable[tokenFrom]!=false, "token not exist");
        tokens[tokenTo]=address(0);
        tokenAvailable[tokenFrom]=false;
    }
    function tokenAvailableOf(address token_) external view returns(bool)
    {
        return tokenAvailable[token_];
    }
    function updateChainById(uint256 chainId_) external{
        require(chains[chainId_]==false, "chain exist");
        chains[chainId_]=true;
    }
    function swap(address recipient,
                    uint256 amount,
                    uint256 chainFrom,
                    uint256 chainTo,    
                    address token) external {
                require(tokenAvailable[token]==true,"token not available");
                require(chains[chainFrom]&&chains[chainTo],"chains are not available");
                require(chainTo!=chainFrom,"chainTo==chainFrom");
                Token(token).burn(msg.sender,amount);                
                emit SwapInitialized(recipient,amount,chainFrom,chainTo,token,nonce);
                nonce++;


    }
    function redeem(address recipient,
                    uint256 amount,
                    uint256 chainFrom,
                    uint256 chainTo,
                    address token,
                    uint256 nonce,
                    uint8 v, 
                    bytes32 r, 
                    bytes32 s) external{
        bytes32 signedDataHash = keccak256(
            abi.encodePacked(recipient,amount,chainFrom,chainTo,token,nonce)
        );
        bytes32 message = signedDataHash.toEthSignedMessageHash();
        require(!signatures[message], "message already done");
        signatures[message]=true;
        address signer = message.recover(v, r, s);
        require(validator==signer, "signer not validator");
        Token(tokens[token]).mint(recipient,amount);
    }

    event SwapInitialized(address recipient,uint256 amount,uint256 chainFrom,uint256 chainTo,address token,uint256 nonce);
                    
}