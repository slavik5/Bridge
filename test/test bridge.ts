import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let addr: SignerWithAddress[];
let validator: SignerWithAddress;
let Token1: ContractFactory;
let token1: Contract;
let Token2: ContractFactory;
let token2: Contract;
let Chain1: ContractFactory;
let chain1: Contract;
let Chain2: ContractFactory;
let chain2: Contract;
let zeroAdd: string;


describe("token contract", function () {


  beforeEach(async () => {
    addr = await ethers.getSigners();
    validator = addr[0];
    Token1 = await ethers.getContractFactory("Token");
    token1 = await Token1.deploy();
    
    Token2 = await ethers.getContractFactory("Token");
    token2 = await Token2.deploy();

    Chain1=await ethers.getContractFactory("Bridge");
    chain1=await Chain1.deploy(1,validator.address);

    Chain2=await ethers.getContractFactory("Bridge");
    chain2=await Chain2.deploy(2,validator.address);

    await token1.grantRole(await token1.DEFAULT_ADMIN_ROLE(), chain1.address);
    await token2.grantRole(await token2.DEFAULT_ADMIN_ROLE(), chain2.address);
    zeroAdd = '0x0000000000000000000000000000000000000000';
  });
  describe("redeem", function () {
    it("redeem 10 tokens", async function () {

        await chain1.includeToken(token1.address,token2.address); 
        await chain2.includeToken(token2.address,token1.address);
        await chain1.updateChainById(2);
        await chain2.updateChainById(1);
        await chain1.swap(addr[1].address,10,1,2,token1.address);
        const signedDataHash = ethers.utils.solidityKeccak256(
            ["address", "uint256", "uint256","uint256","address","uint256"],
            [addr[1].address, 10, 1,2,token1.address,0]
        );
        const bytesArray = ethers.utils.arrayify(signedDataHash);
        const flatSignature = await validator.signMessage(bytesArray);
        const signature = ethers.utils.splitSignature(flatSignature);
        await chain2.redeem(addr[1].address, 10, 1,2,token1.address,0,signature.v, signature.r, signature.s);
        expect(await token2.balanceOf(addr[1].address)).to.equal(10);
    });
    it("signer not validator", async function () {

        await chain1.includeToken(token1.address,token2.address); 
        await chain2.includeToken(token2.address,token1.address);
        await chain1.updateChainById(2);
        await chain2.updateChainById(1);
        await chain1.swap(addr[1].address,10,1,2,token1.address);
        const signedDataHash = ethers.utils.solidityKeccak256(
            ["address", "uint256", "uint256","uint256","address","uint256"],
            [addr[1].address, 10, 1,2,token1.address,0]
        );
        const bytesArray = ethers.utils.arrayify(signedDataHash);
        const flatSignature = await addr[2].signMessage(bytesArray);
        const signature = ethers.utils.splitSignature(flatSignature);
        await expect(chain2.redeem(addr[1].address, 10, 1,2,token1.address,0,signature.v, signature.r, signature.s))
        .to.be.revertedWith("signer not validator");
        
    });
    it("message already done", async function () {

        await chain1.includeToken(token1.address,token2.address); 
        await chain2.includeToken(token2.address,token1.address);
        await chain1.updateChainById(2);
        await chain2.updateChainById(1);
        await chain1.swap(addr[1].address,10,1,2,token1.address);
        const signedDataHash = ethers.utils.solidityKeccak256(
            ["address", "uint256", "uint256","uint256","address","uint256"],
            [addr[1].address, 10, 1,2,token1.address,0]
        );
        const bytesArray = ethers.utils.arrayify(signedDataHash);
        const flatSignature = await validator.signMessage(bytesArray);
        const signature = ethers.utils.splitSignature(flatSignature);
        await chain2.redeem(addr[1].address, 10, 1,2,token1.address,0,signature.v, signature.r, signature.s);
        await expect(chain2.redeem(addr[1].address, 10, 1,2,token1.address,0,signature.v, signature.r, signature.s)).to.be.revertedWith("message already done");
        
    });
  });
  describe("swap", function () {
    it("token not available", async function () {
        await expect(chain1.swap(addr[1].address,10,1,2,token1.address)).to.be.revertedWith("token not available");
    });
    it("chains are not available", async function () {
        await chain1.includeToken(token1.address,token2.address); 
        await expect(chain1.swap(addr[1].address,10,1,2,token1.address)).to.be.revertedWith("chains are not available");
    });
    it("chainTo==chainFrom", async function () {
        await chain1.includeToken(token1.address,token2.address); 
        await chain1.updateChainById(2);
        await expect(chain1.swap(addr[1].address,10,1,1,token1.address)).to.be.revertedWith("chainTo==chainFrom");
    });
    
  });
  describe("include", function () {
    it("token exist", async function () {
        await chain1.includeToken(token1.address,token2.address);
        await expect(chain1.includeToken(token1.address,token2.address)).to.be.revertedWith("token exist");
    });
    
  });
  describe("updateChainById", function () {
    it("chain exist", async function () {
        await chain1.updateChainById(2);
        await expect(chain1.updateChainById(2)).to.be.revertedWith("chain exist");
    });
    
  });
  describe("exclude", function () {
    it("token not exist", async function () {
        
        await expect(chain1.excludeToken(token1.address,token2.address)).to.be.revertedWith("token not exist");
    });
    it("exclude", async function () {
        await chain1.includeToken(token1.address,token2.address);
        await chain1.excludeToken(token1.address,token2.address);
        expect(await chain1.tokenAvailableOf(token1.address)).to.equal(false);
    });
    
  });
});