import React from "react";
import tw from "tailwind-styled-components";
import { useRouter } from "next/router";
import { useFormik } from "formik";
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


export default function buildOrder() {
    const router = useRouter();
    const { dispatch } = useContext(StoreContext);

    //* I've chosen MetaMask as the connector,
    const { connect, error, isConnecting, pendingConnector } = useConnect({
        chainId: 5,
        connector: new MetaMaskConnector(),
    });
    const { data: account } = useAccount();
    const { disconnect } = useDisconnect();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [assets, setAssets] = useState([]);
    const [mongoData, setMongoData] = useState()

    const handlerVisible = () => setVisible(true);
    const handler = () => setLoading(true);

//Adding Private Orderbook- start
    async function postMongo(data) {
        console.log("clicked postMongo", data)
        return axios.post("http://localhost:3000/api/route", 
            {
                erc20Token: data.erc20Token,
                erc20TokenAmount: data.erc20TokenAmount,
                nftToken: data.nftToken,
                nftTokenId: data.nftTokenId,
                nftTokenAmount: data.nftTokenAmount,
                nftType: "ERC721",
                sellOrBuyNft: "sell",
                chainId: "5",
                order: {
                    direction: data.direction,
                    erc20Token: data.erc20Token,
                    erc20TokenAmount: data.erc20TokenAmount,
                    erc721Token: data.erc721Token,
                    erc721TokenId: data.erc721TokenId,
                    erc721TokenProperties: data.erc721TokenProperties,
                    expiry: data.expiry,
                    fees: data.fees,
                    maker: data.maker,
                    nonce: data.nonce,
                    signature: {
                        r: data.signature.r,
                        s: data.signature.s,
                        v: data.signature.v,
                        signatureType: data.signature.signatureType,
        
                    },
                    taker: data.taker
                },
                orderStatus: {
                    status: null,
                    transactionHash: null,
                    blockNumber: null
                },
                metadata: {}
            }
        )
          .then(response => {
            console.log(response.data);
            return response.data;
          })
          .catch(error => {
            console.error(error);
            // throw error;
          });
      }
//Adding Private Orderbook- end



    const getMetaData = async () => {

        const options = { method: 'GET', headers: { accept: 'application/json', 'X-API-Key': 'test' } };

        fetch('https://api.center.dev/v1/ethereum-goerli/account/vitalik.eth/assets-owned', options)
            .then(response => response.json())
            .then(response => {
                console.log(response)
                setAssets(response.items)
            })
            .catch(err => console.error(err));

    };
    useEffect(() => {
        getMetaData();
    }, [])

    //* form submission handling
    const formik = useFormik({
        initialValues: {
            price: "1",
            nftContract: "",
            myNFT: "0xcDc8e8040C998306CfbA9af8BAe3E1A05D4C23cF",
        },

        onSubmit: async (values) => {
            const takerData = {
                contractAddress: values.nftContract,
                takerAddress: values.price,
            };
            handler();
            handlerVisible();
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                //CURRENTLY SET CHAIN ID TO DEV CHAIN GANACHE
                console.log("Debug: 1")
                const CHAIN_ID = 5;
                console.log(CHAIN_ID);


                const params = {
                    appId: '314159',
                    zeroExExchangeProxyContractAddress: "0xf91bb752490473b8342a3e964e855b9f9a2a668e",
                    orderbookRootUrl: "https://api.trader.xyz"
                }


                const nftSwapSdk = new NftSwapV4(provider, signer, CHAIN_ID, params);

                const userNFT = {
                    tokenAddress: values.myNFT,
                    tokenId: "1",
                    type: "ERC721"
                };

                const usdc = {
                    tokenAddress: "0x7af963cf6d228e564e2a0aa0ddbf06210b38615d",
                    amount: values.price,
                    type: "ERC20"
                };
                const approval = await nftSwapSdk.loadApprovalStatus(
                    userNFT,
                    account.address
                );
                console.log("approval",approval)
                // If we do need to approve User A's CryptoPunk for swapping, let's do that now
                if (!approval.contractApproved) {
                    const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
                        userNFT,
                        account.address
                    );
                    const approvalTxReceipt = await approvalTx.wait();
                    console.log(
                        `Approved to swap with 0x v4 (txHash: ${approvalTxReceipt.transactionHash})`
                    );
                }
                
                dispatch({ type: ACTION_TYPES.SET_MAKER_DATA, payload: { userNFT } });
                console.log("Debug: 1")
                console.log("userNFT",userNFT, "nftSwapSdk",nftSwapSdk )
                const order = nftSwapSdk.buildOrder(userNFT, usdc, account.address);
                console.log("Debug: 2")
                console.log("order", order)
                // await nftSwapSdk.approveTokenOrNftByAsset(userNFT, account.address);
                console.log("Debug: 3")
                const signedOrder = await nftSwapSdk.signOrder(order);
                console.log("Debug: 4")
                console.log("signed order: ", signedOrder)

                const postedPrivateOrder= await postMongo(signedOrder)
                console.log(postedPrivateOrder)

                // const postedOrder = await nftSwapSdk.postOrder(signedOrder, 5);
                console.log("Debug: 5")
                // console.log("postedOrder",postedOrder)
            
               
            } catch (error) {
                console.log(error.message);
                setErrorMessage(true);
            }
        },
    });
    //* form submission handling
    return (
        <Container>
            <Head>
                <title>NFT Swap: Maker</title>
            </Head>
            <Containing className="glass" onSubmit={formik.handleSubmit}>
                <Header>NFT &lt;&gt; BUILD ORDER</Header>
                {account ? <EthName address={account.address} /> : <h3>Please connect your wallet !</h3>}
                <div>
                    <label>NFT</label>
                    <Input
                        type="text"
                        name="myNFT"
                        id="myNFT"
                        clearable
                        size="lg"
                        placeholder="NFT Contract Address"
                        disabled={!account ? true : false}
                        {...formik.getFieldProps("myNFT")}
                    />

                    {formik.touched.myNFT && formik.errors.myNFT ? <p>{formik.errors.myNFT}</p> : null}
                </div>
                <div>
                    <label>Price</label>
                    <Input
                        type="text"
                        name="price"
                        id="price"
                        disabled={!account ? true : false}
                        clearable
                        size="lg"
                        placeholder="USDC Price"
                        {...formik.getFieldProps("price")}
                    />
                    {formik.touched.price && formik.errors.price ? <p>{formik.errors.price}</p> : null}
                </div>
                {/* <label>NFT Contract</label>
                <div>
                    <Input
                        type="text"
                        name="NFTContract"
                        id="NFTContract"
                        disabled={!account ? true : false}
                        clearable
                        size="lg"
                        placeholder="Other NFT Contract"
                        {...formik.getFieldProps("nftContract")}
                    />

                    {formik.touched.nftContract && formik.errors.nftContract ? <p>{formik.errors.nftContract}</p> : null}
                </div> */}

                {!account ? (
                    <Button
                        css={{ background: "#df0d0de4" }}
                        iconRight={isConnecting && pendingConnector ? <Loading color="currentColor" size="sm" /> : ""}
                        onClick={() => {
                            connect()
                            setIsConnected(true);
                        }
                        }
                    >
                        {isConnecting && pendingConnector ? "Connecting..." : "Connect"}
                    </Button>
                ) : (
                    <>
                        <div>
                            Connected to <span className="font-bold">{account?.connector?.name}</span> !
                        </div>
                        <Button type="submit" css={{ background: "#ca1010" }}>
                            BUILD !
                        </Button>
                        <Button css={{ background: "#220abe" }} onClick={disconnect}>
                            Disconnect
                        </Button>
                    </>
                )}

                {error && <div>{error.message}</div>}
            </Containing>


            {
                loading && (
                    <Modal open={visible} preventClose blur className="bg-transparent shadow-none ">
                        <Loading color={errorMessage ? "error" : "primary"} size="lg">
                            {!errorMessage ? "Please sign & Approve all transactions..." : "Transaction Failed, Try again"}
                        </Loading>
                        <Loader></Loader>
                    </Modal>
                )
            }

        </Container >

    )
}