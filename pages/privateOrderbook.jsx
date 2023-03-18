import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { NftSwapV4, NftSwap } from "@traderxyz/nft-swap-sdk";
import { ethers } from "ethers";
import { useConnect, useAccount, useDisconnect, chain } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import React from "react";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import Router from 'next/router';

export default function Orderbook() {
    const router = useRouter();

    const [orders, setOrders] = useState([])
    const [filterOrder, setFilterOrder] = useState(orders)
    const [filterByChainId, setFilterByChainId] = useState();
    const [nftType, setNftType] = useState("Select NFT Type");
    const [show, setShow] = useState(false);
    const [selectedNft, setSelectedNft] = useState({
        tokenId: '',
        addr: '',
        or: ""
    })
    const handleClose = () => setShow(false);

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


    async function handleBuy() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("Debug: ", provider, "---", signer);
        try {

            const params = {
                appId: '314159',
                zeroExExchangeProxyContractAddress: "0xf91bb752490473b8342a3e964e855b9f9a2a668e",
                orderbookRootUrl: "https://api.trader.xyz"
            }

            console.log("DEBUG")
            const swapSdk = new NftSwapV4(provider, signer, 5, params);

            console.log("DEBUG2")
            //approval
            const userBERC20 = {
                tokenAddress: "0x7af963cf6d228e564e2a0aa0ddbf06210b38615d",
                amount: "1000000000000000000",
                type: "ERC20"
            };

            console.log("DEBUG3: ", userBERC20, "--", account.address);
            const approval = await swapSdk.loadApprovalStatus(
                userBERC20,
                account.address
            );

            console.log("DEBUG4")
            console.log("approval", approval)
            // If we do need to approve User A's CryptoPunk for swapping, let's do that now
            // if (!approval.contractApproved) {
            const approvalTx = await swapSdk.approveTokenOrNftByAsset(
                userBERC20,
                account.address
            );
            const approvalTxReceipt = await approvalTx.wait();
            console.log(
                `Approved to swap with 0x v4 (txHash: ${approvalTxReceipt.transactionHash})`
            );
            // }

            console.log("Order", selectedNft.or);
            const tx = await swapSdk.fillSignedOrder(selectedNft.or,undefined,{
                gasLimit: "500000",
                // HACK(johnnrjj) - Rinkeby still has protocol fees, so we give it a little bit of ETH so its happy.
                value: ethers.utils.parseEther("0.01"),
            });
            console.log("tx", tx)
            const txReceipt = await swapSdk.awaitTransactionHash(tx.hash);
            console.log("txReceipt", txReceipt)
            console.log('Filled order! 🎉', txReceipt.transactionHash);
        }
        catch (err) {
            console.log(err);

            console.log("order: ", selectedNft);
            setErrorMessage(true);
        }
    }
   
    const getOrderData = async () => {

        const options = { method: 'GET', headers: { accept: 'application/json', 'X-API-Key': 'test' } };

        fetch('http://localhost:3000/api/route', options)
            .then(response => response.json())
            .then(response => {

                // console.log(response.data)
                setOrders(response.data)

            })
            .catch(err => console.error(err));

    };
    function handleFilter(nftType) {
        // console.log(nftType);

        setNftType(nftType)
        const filterByNftType = orders.filter(index =>
            index.nftType === `${nftType}` && index.chainId === "5"
        )
        console.log("filterByNftType",filterByNftType);
        setFilterOrder(filterByNftType)
        console.log("filterOrder",filterOrder)
    }
    const handleShow = (id, ad, order) => {
        setShow(true)
        setSelectedNft({
            tokenId: id,
            addr: ad,
            or: order
        })
        console.log("selectedNft", selectedNft)

    };

    useEffect(() => {
        getOrderData();
        console.log("selectedNft: ", selectedNft);
        console.log("filterOrder", filterOrder)
    }, [])

    return (
        <div class="text-center m-8">
            <h1>Private Orderbook</h1>
            <div>
                <DropdownButton
                    id="dropdown-button-dark-example2"
                    variant="secondary"
                    menuVariant="dark"
                    title={nftType}
                    className="mt-2 text-left"
                >

                    <Dropdown.Item onClick={() => handleFilter("ERC20")}>ERC-20</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleFilter("ERC721")}>ERC-721</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleFilter("ERC1155")}>ERC-1155</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => {
                        setNftType("All")
                        setFilterOrder(orders)
                    }
                    }

                    >All</Dropdown.Item>

                </DropdownButton>

                <Container class="my-4 inline-flex flex-wrap">
                    {filterOrder.filter(index => index.sellOrBuyNft === "sell").map(nft => (
                        <Card
                            style={{ width: '20rem', margin: '10px' }}
                            onClick={() => handleShow(nft.order.erc721TokenId, nft.order.erc721Token, nft.order)}

                        >
                            <Card.Body>
                                <Card.Title>{nft.nftType}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">Price: {nft.erc20TokenAmount}</Card.Subtitle>
                                <Card.Text class="text-left mb-2">

                                    <li>erc20Token: {nft.erc20Token}</li>
                                    <li>erc20TokenAmount: {nft.erc20TokenAmount}</li>
                                    <li>nftToken: {nft.order.erc721Token}</li>
                                    <li>nftTokenId: {nft.order.erc721TokenId}</li>
                                    <li>chainId: {nft.chainId}</li>

                                </Card.Text>

                            </Card.Body>
                        </Card>

                    ))}

                </Container>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Fill Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p> NFT Token Id: {selectedNft.tokenId}</p>
                    <p>Contract Address: {selectedNft.addr}</p>
                    {/* <input type="number" onChange={(e) => setPrice(Number(e.target.value))}></input> */}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>

                    <Button variant="primary" onClick={handleBuy}>
                        Confirm Order
                    </Button>

                </Modal.Footer>
            </Modal>
        </div>
    )
}