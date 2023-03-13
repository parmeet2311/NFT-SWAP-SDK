import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { NftSwapV4 } from "@traderxyz/nft-swap-sdk";
import { ethers } from "ethers";
import { useConnect, useAccount, useDisconnect, chain } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import React from "react";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

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
        order: ""
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
        try {
            const swapSdk = new NftSwapV4(provider, signer, 5);
            const tx = await swapSdk.fillSignedOrder(selectedNft.order);
            const txReceipt = await fillTx.wait();
            console.log('Filled order! 🎉', txReceipt.transactionHash);
        }
        catch (err) {
            console.log(err.message);
            setErrorMessage(true);
            setInterval(() => {
                router.reload(window.location.pathname);
            }, 30000);
        }
    }

    const getOrderData = async () => {

        const options = { method: 'GET', headers: { accept: 'application/json', 'X-API-Key': 'test' } };

        fetch('https://api.trader.xyz/orderbook/orders', options)
            .then(response => response.json())
            .then(response => {

                console.log(response.orders)
                setOrders(response.orders)

            })
            .catch(err => console.error(err));

    };
    function handleFilter(nftType) {
        // console.log(nftType);

        setNftType(nftType)
        const filterByNftType = orders.filter(index =>
            index.nftType === `${nftType}` && index.chainId === "5"
        )
        // console.log(filterByNftType);
        setFilterOrder(filterByNftType)
        // console.log(filterOrder)
    }
    const handleShow = (id, ad, or) => {
        setShow(true)
        setSelectedNft({
            tokenId: id,
            addr: ad,
            order: or
        })
        // console.log(address, selectedNft)

    };

    useEffect(() => {
        getOrderData();
    }, [])

    return (
        <div class="text-center m-8">
            <h1>Orderbook</h1>
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
                            onClick={() => handleShow(nft.nftTokenId, nft.nftToken, nft.order)}

                        >
                            <Card.Body>
                                <Card.Title>{nft.nftType}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">Price: {nft.nftTokenAmount}</Card.Subtitle>
                                <Card.Text class="text-left mb-2">

                                    <li>erc20Token: {nft.erc20Token}</li>
                                    <li>erc20TokenAmount: {nft.erc20TokenAmount}</li>
                                    <li>nftToken: {nft.nftToken}</li>
                                    <li>nftTokenId: {nft.nftTokenId}</li>
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
