import React from "react";
import tw from "tailwind-styled-components";
import { useRouter } from "next/router";
// import { useFormik } from "formik";
import * as Yup from "yup";
import { Input, Button, Loading, Modal } from "@nextui-org/react";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { useConnect, useAccount, useDisconnect, chain } from "wagmi";
import EthName from "../components/ETHName";
import { swap } from "../utils/swapping";
import { useContext, useEffect, useState } from "react";
import { ACTION_TYPES, StoreContext } from "../store/store-context";
import Head from "next/head";
import axios from "axios"
import { NftSwapV4 } from "@traderxyz/nft-swap-sdk";
import { ethers } from "ethers";

const Container = tw.div` text-black flex items-center justify-center flex-col w-full h-screen   `;
const Header = tw.h1`text-3xl font-bold mx-5 my-1`;
const Containing = tw.form` flex items-center justify-between flex-col w-fit h-[36rem] px-5 py-5 my-5 rounded-3xl  `;
const Loader = tw.h2`font-bold text-red-700 `;
const Required = tw.h6`font-bold text-red-700 rounded`;

export default function BuyOrder() {

    const router = useRouter();
    const { dispatch } = useContext(StoreContext);
    const {
        state: { makerData, takerData },
      } = useContext(StoreContext);

    const signedorder = router.query.signedorder;

    //* I've chosen MetaMask as the connector,
    const { connect, error, isConnecting, pendingConnector } = useConnect({
        chainId: chain.localhost.id,
        connector: new MetaMaskConnector(),
    });
    const { data: account } = useAccount();
    const { disconnect } = useDisconnect();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [assets, setAssets] = useState([]);

    const handlerVisible = () => setVisible(true);
    const handler = () => setLoading(true);
    
    
    async function handleSubmit(){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const swapSdk = new NftSwapV4(provider, signer);

        try {
            const tx = await swapSdk.fillSignedOrder(signedorder);
            const txReceipt = await fillTx.wait();
            console.log('Filled order! 🎉', txReceipt.transactionHash);
        }
        catch (err) {
            console.log(error.message);
            setErrorMessage(true);
            setInterval(() => {
                router.reload(window.location.pathname);
            }, 3000);
        }
    }
    function test(){
        console.log(makerData);
    }

    // useEffect(() => {
    //     if (!makerData) {
    //       router.push("/buildorder");
    //     }
    //   }, [makerData]);

    return (
        // <Container>
        //     {!account ? (
        //         <Button
        //             css={{ background: "#df0d0de4" }}
        //             iconRight={isConnecting && pendingConnector ? <Loading color="currentColor" size="sm" /> : ""}
        //             onClick={() => {
        //                 connect()
        //                 setIsConnected(true);
        //             }
        //             }
        //         >
        //             {isConnecting && pendingConnector ? "Connecting..." : "Connect"}
        //         </Button>
        //     ) : (
        //         <>
        //             <div>
        //                 Connected to <span className="font-bold">{account?.connector?.name}</span> !
        //             </div>
        //             <Button onClick={handleSubmit()} css={{ background: "#ca1010" }}>
        //                 Fill Order !
        //             </Button>
        //             <Button css={{ background: "#220abe" }} onClick={disconnect}>
        //                 Disconnect
        //             </Button>
        //         </>
        //     )}

        //     {error && <div>{error.message}</div>}
        //     <h1>Transaction: {txReceipt}</h1>
        // </Container>
        <Container>
            <h1>Buy Order</h1>
            <Button onClick={test}>Click me</Button>
        </Container>
    )
}