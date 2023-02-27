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

//* this is styling
const Container = tw.div` text-black flex items-center justify-center flex-col w-full h-screen   `;
const Header = tw.h1`text-3xl font-bold mx-5 my-1`;
const Containing = tw.form` flex items-center justify-between flex-col w-fit h-[36rem] px-5 py-5 my-5 rounded-3xl  `;
const Loader = tw.h2`font-bold text-red-700 `;
const Required = tw.h6`font-bold text-red-700 rounded`;
//* this is styling

export default function App() {
  const router = useRouter();
  const { dispatch } = useContext(StoreContext);

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
      nftHolder: "0x9BD2c12955820D51838528A1863D2e7a682bc8B8",
      nftContract: "0x07fcb3A4b8a6A7044EF722d3c70FffE069Eb161C",
      myNFT: "0x9a0D60F7c3C90A2c661689a8690CA7B1731EC7F0",
    },
    
    onSubmit: async (values) => {
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
    },
  });
  //* form submission handling
  return (
    <Container>
      <Head>
        <title>NFT Swap: Maker</title>
      </Head>
      <Containing className="glass" onSubmit={formik.handleSubmit}>
        <Header>NFT &lt;&gt; NFT Swapping</Header>
        {account ? <EthName address={account.address} /> : <h3>Please connect your wallet !</h3>}
        <div>
          <label>My NFT</label>
          <Input
            type="text"
            name="myNFT"
            id="myNFT"
            clearable
            size="lg"
            placeholder="My NFT contract"
            disabled={!account ? true : false}
            {...formik.getFieldProps("myNFT")}
          />

          {formik.touched.myNFT && formik.errors.myNFT ? <p>{formik.errors.myNFT}</p> : null}
        </div>
        <div>
        <label>NFT holder</label>
          <Input
            type="text"
            name="NFTholder"
            id="NFTholder"
            disabled={!account ? true : false}
            clearable
            size="lg"
            placeholder="NFT holder"
            {...formik.getFieldProps("nftHolder")}
          />
          {formik.touched.nftHolder && formik.errors.nftHolder ? <p>{formik.errors.nftHolder}</p> : null}
        </div>
        <label>NFT Contract</label>
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
        </div>

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
              Swap !
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
