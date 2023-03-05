import { NftSwapV4 } from "@traderxyz/nft-swap-sdk";
import { ethers } from "ethers";
import axios from "axios";

export async function swapV4Build (walletAddress, usdcAmount, nftAddress, chainid){
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //CURRENTLY SET CHAIN ID TO DEV CHAIN GANACHE
    const CHAIN_ID = chainid; 

    const nftSwapSdk = new NftSwapV4(provider, signer, CHAIN_ID);

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

    const order = nftSwapSdk.buildOrder(userNFT, usdc, walletAddress);

    await nftSwapSdk.approveTokenOrNftByAsset(userNFT, walletAddress);

    const signedOrder = nftSwapSdk.signOrder(order);

    console.log("signed order: ",signedOrder)
    return signedOrder;
}