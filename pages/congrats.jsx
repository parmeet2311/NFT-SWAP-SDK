import { useContext, useEffect } from "react";
import { StoreContext } from "../store/store-context";
import { useRouter } from "next/router";
import Head from "next/head";

const Congrats = () => {
  const router = useRouter();
  const {
    state: { txhash },
  } = useContext(StoreContext);

  useEffect(() => {
    if (!txhash) {
      router.push("/");
    }
  }, [txhash]);
  if (txhash) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen text-black selection:bg-red-700 selection:text-white">
        <Head>
          <title>NFT Swap Completed 🥳</title>
        </Head>
        <h1>Congratulations 🎉🥳 !!!</h1>

       
      </div>
    );
  }
};

export default Congrats;
