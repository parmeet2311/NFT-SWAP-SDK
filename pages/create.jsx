import { useContext, useEffect, useState } from "react"
import tw from "tailwind-styled-components";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Input, Loading, Modal as Modal1 } from "@nextui-org/react";
import { useRouter } from "next/router";
import EthName from "../components/ETHName";
import { useConnect, useAccount, useDisconnect, chain } from "wagmi";
import { swap } from "../utils/swapping";
import { ACTION_TYPES, StoreContext } from "../store/store-context";
import axios from "axios"
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { swapV4Build } from "../utils/swapV4Build";



//styling
const Container = tw.div` text-black flex items-center justify-center flex-col    `;
const Loader = tw.h2`font-bold text-red-700 `;
const Header = tw.h1`text-3xl font-bold mx-5 my-1`;
const Containing = tw.form` flex items-center justify-between flex-col w-fit h-[36rem] px-5 py-5 my-5 rounded-3xl  `;
const Required = tw.h6`font-bold text-red-700 rounded`;


export default function Create() {
    const router = useRouter();
    const { dispatch } = useContext(StoreContext);
    const [assets, setAssets] = useState([]);
    const { connect, error, isConnecting, pendingConnector } = useConnect({
        chainId: chain.localhost.id,
        connector: new MetaMaskConnector(),
    });
    const { data: account } = useAccount();
    const { address } = useAccount();
    const [price, setPrice] = useState();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const handleClose = () => setShow(false);
    const [initialValues, setInitialValues] = useState({
        myNFT: "0x39b9214b075E732b6eD85E7c5058426cf7F42c41",
        nftContract: "0x1fef63847224FEDE78BA3f1622b3b81B822D1bfA",
        nftHolder: "0x9BD2c12955820D51838528A1863D2e7a682bc8B8"

    })
    const [takerData, setTakerData] = useState({
        contractAddress: initialValues.nftContract,
        takerAddress: initialValues.nftHolder,

    })
    const [selectedNft, setSelectedNft] = useState({
        tokenId: '',
        addr: ''
    })
    const handlerVisible = () => setVisible(true);
    const handler = () => setLoading(true);

    async function handleSell1(values) {
        console.log(values);
        const takerData = {
            contractAddress: values.nftContract,
            takerAddress: values.nftHolder,
        };
        handler();
        handlerVisible();
        try {
            const makerData = await swap(account.address, values.myNFT, values.nftContract);
            dispatch({ type: ACTION_TYPES.SET_MAKER_DATA, payload: { makerData } });
            dispatch({ type: ACTION_TYPES.SET_TAKER_DATA, payload: { takerData } });
            setLoading(false);
            setVisible(false);
            router.push("/taker");
        } catch (error) {
            console.log(error.message);
            setErrorMessage(true);
            setInterval(() => {
                router.reload(window.location.pathname);
            }, 3000);
        }
      
    }
    async function handleSell2(values) {
        const makerData= await swapV4Build(address,price, initialValues.myNFT)
        console.log(makerData);
      
    }
    const handleShow = (id, ad) => {
        setShow(true)
        setSelectedNft({
            tokenId: id,
            addr: ad
        })
        console.log(address, selectedNft)

    };


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
        console.log("asset", assets);
        getMetaData();
        console.log(selectedNft)
    }, [])

    return (
        <Container style={{ textAlign: "center" }}>
            <h3>Create Order</h3>
            <div>
                <h5>Your NFTs</h5>
                <div>
                    {assets.map((asset) => (
                        <div
                            onClick={() => handleShow(asset.tokenId, asset.address)}
                            style={{ backgroundColor: "lime", margin: "5px" }}
                        >
                            <div >
                                <h2>{asset.tokenId}</h2>
                                <p>{asset.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Set Price</Modal.Title>
                </Modal.Header>
                <Modal.Body>NFT Token Id:{selectedNft.tokenId} Contract Address:{selectedNft.addr}
                    <label>Enter Price</label>
                    <input type="number" onChange={(e) => setPrice(Number(e.target.value))}></input>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>

                    <Button variant="primary"
                        disabled={!price ? true : false}
                        onClick={() => handleSell1(initialValues)}

                    >
                        Confirm Order
                    </Button>
                    <Button variant="primary"
                        disabled={!price ? true : false}
                        onClick={() => handleSell2(initialValues)}

                    >
                        Confirm Order for V4
                    </Button>
                </Modal.Footer>
            </Modal>
            {
                loading && (
                    <Modal1 open={visible} preventClose blur className="bg-transparent shadow-none ">
                        <Loading color={errorMessage ? "error" : "primary"} size="lg">
                            {!errorMessage ? "Please sign & Approve all transactions..." : "Transaction Failed, Try again"}
                        </Loading>
                        <Loader></Loader>
                    </Modal1>
                )
            }
        </Container>
    )
}
