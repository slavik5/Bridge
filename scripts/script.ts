import {ethers} from "hardhat";

async function main() {
  
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy(97,"0xC55d74a292ABB9F85DD9D550590a1F86D6706307");
  await bridge.deployed();
  
  console.log("Token deployed to:", token.address);
  console.log("Bridge deployed to:", bridge.address);  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
