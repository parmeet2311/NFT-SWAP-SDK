import { NftSwap,NftSwapV4 } from "@traderxyz/nft-swap-sdk";
import { ethers } from "ethers";
// import { postOrderToOrderbook } from "@traderxyz/nft-swap-sdk";
import axios from "axios"
import { useContext, useEffect, useState } from "react";



  

export async function part2(userAddress, userNFT, makerData) {
  let signedOrder = makerData;

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const CHAIN_ID = 1337; //ganache
  const Aether_420 = {
    tokenAddress: userNFT,
    tokenId: "1",
    type: "ERC721",
  };

  // User B Trade Data
  const walletAddressUserB = userAddress;
  const assetsToSwapUserB = [Aether_420];
  // ............................
  // Part 2 of the trade -- User B (the 'taker') accepts and fills order from User A and completes trade
  // ............................
  // Initiate the SDK for User B.
  const signer = provider.getSigner();
  console.log(signer);
  const nftSwapSdk = new NftSwapV4(provider, signer, CHAIN_ID);

  // Check if we need to approve the NFT for swapping
  const approvalStatusForUserB = await nftSwapSdk.loadApprovalStatus(assetsToSwapUserB[0], walletAddressUserB);
  // If we do need to approve NFT for swapping, let's do that now
  if (!approvalStatusForUserB.contractApproved) {
    const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(assetsToSwapUserB[0], walletAddressUserB);
    const approvalTxReceipt = await approvalTx.wait();
    console.log(`Approved ${assetsToSwapUserB[0].tokenAddress} contract to swap with 0x. TxHash: ${approvalTxReceipt.transactionHash})`);
  }
  // The final step is the taker (User B) submitting the order.
  // The taker approves the trade transaction and it will be submitted on the blockchain for settlement.
  // Once the transaction is confirmed, the trade will be settled and cannot be reversed.
  const fillTx = await nftSwapSdk.fillSignedOrder(signedOrder, undefined, {
    gasLimit: "500000",
    // HACK(johnnrjj) - Rinkeby still has protocol fees, so we give it a little bit of ETH so its happy.
    value: ethers.utils.parseEther("0.01"),
  });
  console.log(fillTx);
  const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx.hash);

  console.log(`🎉 🥳 Order filled. TxHash: ${fillTxReceipt.transactionHash}`);

  return fillTxReceipt.transactionHash;
}

// const postedOrder=axios({
//     method: 'post',
//     url: 'https://api.trader.xyz/orderbook/order',
//     data: {
//       chainId: CHAIN_ID, // This is the body part
//       order: signedOrder
//     }
//   });



// export async function swap(userAddress, userNFT, nftContract, price) {
//   const provider = new ethers.providers.Web3Provider(window.ethereum);

//   const signer = provider.getSigner();

//   const CHAIN_ID = 1337; //ganache

//   const Oizys_69 = {
//     tokenAddress: userNFT,
//     tokenId: "0",
//     type: "ERC721",
//   };
//   const SIXTY_NINE_USDC = {
//     tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC contract address
//     amount: '69000000', // 69 USDC (USDC is 6 digits)
//     type: 'ERC20',
//   };
//   // User A Trade Data
//   const walletAddressUserA = userAddress;
//   const assetsToSwapUserA = [Oizys_69];

//   // User B Trade Data
//   // const walletAddressUserB = nftHolder;
//   const assetsToSwapUserB = [SIXTY_NINE_USDC];
//   // ............................
//   // Part 1 of the trade -- User A (the 'maker') initiates an order
//   // ............................

//   // Initiate the SDK for User A.
//   // Pass the user's wallet signer (available via the user's wallet provider) to the Swap SDK
//   const nftSwapSdk = new NftSwap(provider, signer, CHAIN_ID);
// console.log("nftSwapSdk", nftSwapSdk)
//   // Check if we need to approve the NFT for swapping
//   const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(assetsToSwapUserA[0], walletAddressUserA);
// console.log("approvalStatusForUserA", approvalStatusForUserA)
//   // If we do need to approve User A's CryptoPunk for swapping, let's do that now
//   if (!approvalStatusForUserA.contractApproved) {
//     const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(assetsToSwapUserA[0], walletAddressUserA);
//     const approvalTxReceipt = await approvalTx.wait();
//     console.log(`Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt.transactionHash})`);
//   }

//   // Create the order (Remember, User A initiates the trade, so User A creates the order)
//   const order = nftSwapSdk.buildOrder(assetsToSwapUserA, assetsToSwapUserB, walletAddressUserA);
// console.log("order",order);
//   // Sign the order (User A signs since they are initiating the trade)
//   const signedOrder = await nftSwapSdk.signOrder(order, walletAddressUserA);
//   // Part 1 Complete. User A is now done. Now we send the `signedOrder` to User B to complete the trade.
//   console.log("signedOrder",signedOrder);

//   // const body = {
//   //   chainId: CHAIN_ID, 
//   //   order: signedOrder
//   // };
//   // function postOrder(chainId,signedOrder) {
//   //   axios
//   //     .post('https://api.trader.xyz/orderbook/order', {body}
//   //     )
//   //     .then((response) => {
//   //       console.log(response);
//   //     });
//   // }




//   // const postedOrder = await nftSwapSdk.postOrder(CHAIN_ID,signedOrder);
//   // console.log(postedOrder);
  
//   // console.log(postedOrder)
  
//   return signedOrder;
//   // console.log({
//   //   userAddress,
//   //   userNFT,
//   //   nftHolder,
//   //   nftContract,
//   // });
// }

export async function swap(userAddress, userNFT, nftContract) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = provider.getSigner();

  const CHAIN_ID = 1337; //ganache

  const Oizys_69 = {
    tokenAddress: userNFT,
    tokenId: "0",
    type: "ERC721",
  };
  const Aether_420 = {
    tokenAddress: nftContract,
    tokenId: "1",
    type: "ERC721",
  };
  // User A Trade Data
  const walletAddressUserA = userAddress;
  const assetsToSwapUserA = [Oizys_69];

  // User B Trade Data
  // const walletAddressUserB = nftHolder;
  const assetsToSwapUserB = [Aether_420];
  // ............................
  // Part 1 of the trade -- User A (the 'maker') initiates an order
  // ............................

  // Initiate the SDK for User A.
  // Pass the user's wallet signer (available via the user's wallet provider) to the Swap SDK
  const nftSwapSdk = new NftSwapV4(provider, signer, CHAIN_ID);
  console.log("nftSwapSdk", nftSwapSdk)
  // Check if we need to approve the NFT for swapping
  const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(assetsToSwapUserA[0], walletAddressUserA);
  console.log("approvalStatusForUserA", approvalStatusForUserA)
  // If we do need to approve User A's CryptoPunk for swapping, let's do that now
  if (!approvalStatusForUserA.contractApproved) {
    const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(assetsToSwapUserA[0], walletAddressUserA);
    const approvalTxReceipt = await approvalTx.wait();
    console.log(`Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt.transactionHash})`);
  }

  // Create the order (Remember, User A initiates the trade, so User A creates the order)
  
  const order = nftSwapSdk.buildOrder(
    assetsToSwapUserA,
    assetsToSwapUserB,
    walletAddressUserA
  );
  
  // const order = nftSwapSdk.buildOrder(assetsToSwapUserA, assetsToSwapUserB, walletAddressUserA);
console.log("order",order);
  // Sign the order (User A signs since they are initiating the trade)
  const signedOrder = await nftSwapSdk.signOrder(order, walletAddressUserA);
  // Part 1 Complete. User A is now done. Now we send the `signedOrder` to User B to complete the trade.
  console.log("signedOrder",signedOrder);
  // const postedOrder = await nftSwapSdk.postOrderToOrderbook(signedOrder, CHAIN_ID);
  
  // const postedOrder=axios({
  //   method: 'post',
  //   url: 'https://api.trader.xyz/orderbook/order',
  //   data: {
  //     chainId: CHAIN_ID, // This is the body part
  //     order: signedOrder
  //   }
  // });
  // console.log(postedOrder)
  const newOrder = await nftSwapSdk.postOrder(
    signedOrder,
    nftSwapSdk.CHAIN_ID
  );
  console.log(newOrder);
  return signedOrder;
  // console.log({
  //   userAddress,
  //   userNFT,
  //   nftHolder,
  //   nftContract,
  // });
}
