import { ethers } from "ethers";
import axios from "axios";
import { NftSwapV4 } from "@traderxyz/nft-swap-sdk";

export async function swapV4Build (walletAddress, usdcAmount, nftAddress){
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //CURRENTLY SET CHAIN ID TO DEV CHAIN GANACHE
    const CHAIN_ID = 1337; 

    const nftSwapSdk = new NftSwapV4(provider, signer, CHAIN_ID);
console.log(nftSwapSdk)

    const userNFT = {
        tokenAddress: nftAddress,
        tokenId: "1",
        type: "ERC721"
    };

    const usdc = {
        tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        amount: usdcAmount,
        type: "ERC20"
    };

    const order = nftSwapSdk.buildNftAndErc20Order(userNFT, usdc, 'sell',walletAddress);
    console.log("order",order)
    await nftSwapSdk.approveTokenOrNftByAsset(userNFT, walletAddress);

    const signedOrder = nftSwapSdk.signOrder(order);
console.log(signedOrder);
    await nftSwapSdk.postOrder(signedOrder);
}