import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("swap", "swap tokens")
    .addParam("recipient","swap on this address")
    .addParam("amount", "amount to swap")
    .addParam("chainFrom", "from which chain")
    .addParam("chainTo", "to which chain")
    .addParam("tokenadd", "token to swap")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const bridge = await hre.ethers.getContractAt("Bridge", process.env.Bridge_CONTRACT as string);
        const tokenBSC = await hre.ethers.getContractAt("Token", process.env.Token_BSC_CONTRACT as string);
        const bridgeBSC = await hre.ethers.getContractAt("Bridge", process.env.Bridge_BSC_CONTRACT as string);
        //await token.grantRole(await token.DEFAULT_ADMIN_ROLE(), bridge.address);
        //await tokenBSC.grantRole(await tokenBSC.DEFAULT_ADMIN_ROLE(), bridgeBSC.address);
       
        //await bridge.includeToken(token.address,tokenBSC.address); 
        //await bridgeBSC.includeToken(tokenBSC.address,token.address);
        
        //await bridge.updateChainById(taskArgs.chainto);
        //await bridgeBSC.updateChainById(taskArgs.chainfrom);
        
        // //await bridge.swap(addr[0].address,parseEther(taskArgs.amount),taskArgs.chainFrom,taskArgs.chainTo,taskArgs.token);
        await bridge.connect(addr[0]).swap(addr[1].address,parseEther(taskArgs.amount),taskArgs.chainfrom,taskArgs.chainto,taskArgs.tokenadd);
        
        console.log('swap task Done!');
    });

    