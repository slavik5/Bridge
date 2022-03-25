import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("redeem", "redeem tokens")
    .addParam("amount", "amount to swap")
    .addParam("chainfrom", "from which chain")
    .addParam("chainto", "to which chain")
    .addParam("tokenadd", "token to swap")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const bridge = await hre.ethers.getContractAt("Bridge", process.env.Bridge_CONTRACT as string);
        const tokenBSC = await hre.ethers.getContractAt("Token", process.env.Token_BSC_CONTRACT as string);
        const bridgeBSC = await hre.ethers.getContractAt("Bridge", process.env.Bridge_BSC_CONTRACT as string);
        
        // await tokenBSC.grantRole(await tokenBSC.DEFAULT_ADMIN_ROLE(), bridgeBSC.address);
      
        // await bridgeBSC.includeToken(tokenBSC.address,token.address);
        
        // await bridgeBSC.updateChainById(4);
        const signedDataHash = hre.ethers.utils.solidityKeccak256(
            ["address", "uint256", "uint256","uint256","address","uint256"],
            [addr[1].address, parseEther(taskArgs.amount),taskArgs.chainfrom,taskArgs.chainto,taskArgs.tokenadd,1]
        );
        const bytesArray = hre.ethers.utils.arrayify(signedDataHash);
        const flatSignature = await addr[0].signMessage(bytesArray);
        const signature = hre.ethers.utils.splitSignature(flatSignature);
        await bridgeBSC.redeem(addr[1].address,parseEther(taskArgs.amount),taskArgs.chainfrom,taskArgs.chainto,taskArgs.tokenadd,1,signature.v, signature.r, signature.s);
        console.log('redeem task Done!');

    });