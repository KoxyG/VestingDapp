"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useContext, useState } from "react";
import { Contract, providers } from "ethers";
import Web3Modal from "web3modal";

import { VESTING_ABI, VESTING_CONTRACT_ADDRESS } from "@/contract";

export default function Claim() {
  const CHAIN_ID = 11155111;
  const NETWORK_NAME = "Sepolia";

  const [claiming, setClaiming] = useState(false);

  const web3ModalRef = useRef(new Web3Modal());

  const getVestingContractInstance = useCallback((providerOrSigner) => {
    try {
      return new Contract(
        VESTING_CONTRACT_ADDRESS,
        VESTING_ABI,
        providerOrSigner
      );
    } catch (error) {
      console.error("Error creating vesting contract instance:", error);
    }
  }, []);

  // Helper function to fetch a Signer instance from Metamask
  const getSigner = useCallback(async () => {
    const web3Modal = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(web3Modal);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== CHAIN_ID) {
      window.alert(`Please switch to the ${NETWORK_NAME} network!`);
      throw new Error(`Please switch to the ${NETWORK_NAME} network`);
    }

    const signer = web3Provider.getSigner();
    console.log("Signer:", signer);
    const address = await signer.getAddress();

    if (
      signer.provider &&
      signer.provider.connection &&
      signer.provider.connection.url
    ) {
      const address = await signer.getAddress();
      console.log("Signer address:", address);
    } else {
      console.error("Error: Signer is not properly connected to provider.");
    }
    return signer;
  }, []);

  const claim = async (e) => {
    e.preventDefault();

    try {
      const signer = await getSigner();
      console.log("signer", signer);
      setClaiming(true);
      const vestingContract = getVestingContractInstance(signer);
      console.log("whiteListing Instance", vestingContract);

      const tx = await vestingContract.claimTokens();
      await tx.wait();
      console.log("token claimed", tx);

      setClaiming(false);

      alert("Tokens claimed successfully");
    } catch (error) {
      let errorMessage;
      if (error.message.includes("Not whitelisted")) {
        errorMessage =
          "You are not whitelisted to claim tokens.";
      } else if (error.message.includes("tokens are still being vested")) {
        errorMessage = "Tokens are still being vested.";
      } else {
        errorMessage = "Error claiming tokens: " + error.message;
      }
      alert(errorMessage);
      setClaiming(false);
    }
  };

  return (
    <>
      <div className="max-w-3xl sm:mx-[60px] p-8">
        <Link href="/">{"< Back"}</Link>
      </div>

      <div className="grid w-full sm:w-full justify-items-center pt-[70px] pb-[150px]">
        <div className="pb-[50px] mx-[60px]   text-center ">
          <h3 className="pb-3 font-bold text-xl">
            Vested Tokens can only be claimed after vesting period has elapsed
          </h3>
          <p className="text-gray-400">
            Only whitelisted address can claim tokens
          </p>
        </div>

        <form>
          {!claiming ? (
            <div className="flex flex-col pb-[12px]">
              <button
                onClick={(e) => claim(e)}
                className="rounded-md p-2 bg-[#9637eb]"
              >
                Claim here{" "}
              </button>
            </div>
          ) : (
            <div className="flex flex-col pb-[12px]">
              <button
                disabled={claiming}
                className="rounded-md p-2 bg-[#9667eb]"
              >
                Claiming...
              </button>
            </div>
          )}
        </form>

        <h1 className="text-4xl text-gray-500 py-6 font-black">OR</h1>

        <div className="">
          <h3 className="pt-[50px] text-lg  pb-2">Admin?, Claim here 👇</h3>

          <form>
            <div className="flex  pb-[32px] ">
              <input
                type="text"
                className="rounded"
                placeholder="Admin withdraw"
              />
              <button className="rounded-md p-2 bg-[#9637eb]">
                Admin Only
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
