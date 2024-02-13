"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useContext, useState } from "react";
import { Contract, providers } from "ethers";
import { ethers } from "ethers";

import { VESTING_ABI, VESTING_CONTRACT_ADDRESS } from "@/contract";

export default function Claim() {
  const CHAIN_ID = 11155111;
  const NETWORK_NAME = "Sepolia";

  const [claiming, setClaiming] = useState(false);
  const [adminclaim, setadminClaim] = useState(false);
  const [adminAmount, setAdminAmount] = useState("");

 

  

  const getVestingContractInstance = useCallback((providerOrSigner) => {
    try {
      return new Contract(
        VESTING_CONTRACT_ADDRESS,
        VESTING_ABI,
        providerOrSigner
      );
    } catch (error) {
      alert("Error creating vesting contract instance:", error);
    }
  }, []);

  // Helper function to fetch a Signer instance from Metamask
  const getSigner = useCallback(async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert("pls install metamask to use this feature");
        return;
      }
      // Initialize Web3Provider with window.ethereum
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      // Request access to the user's MetaMask accounts
      await provider.send("eth_requestAccounts", []);
  
      // Get the chain ID from the connected network
      const { chainId } = await provider.getNetwork();
  
      // Check if the chain ID matches your desired network
      if (chainId !== CHAIN_ID) {
        alert(`Please switch to the ${NETWORK_NAME} network!`);
        throw new Error(`Please switch to the ${NETWORK_NAME} network`);
      }
  
      // Get the signer instance
      const signer = await provider.getSigner();
  
      // Log the signer's address
      const address = await signer.getAddress();
      console.log("Signer address:", address);
  
      return signer;
    } catch (error) {
      console.error("Error fetching signer:", error);
      // Handle errors appropriately
      throw error;
    }
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
      } else if (error.message.includes("Tokens has already been claimed")) {
        errorMessage = "Tokens has already been claimed.";
      } else {
        errorMessage = "Error claiming tokens: " + error.message;
      }
      alert(errorMessage);
      setClaiming(false);
    }
  };


  const adminWithdraw = async (e) => {
    e.preventDefault();

    try {
      const signer = await getSigner();
      console.log("signer", signer);
      setadminClaim(true);
      const vestingContract = getVestingContractInstance(signer);
      console.log("whiteListing Instance", vestingContract);

      const tx = await vestingContract.withdrawTokens(formEntry.adminAmount);
      await tx.wait();
      console.log("token claimed", tx);

      setadminClaim(false);
      resetFormEntry();

      alert("Tokens claimed successfully");
    } catch (error) {
      let errorMessage;
      if (error.message.includes("only admin can do this")) {
        errorMessage =
          "only admin can do this";
      } else if (error.message.includes("Not enough tokens in the contract")) {
        errorMessage = "Not enough tokens in the contract.";
      } else {
        errorMessage = "Error claiming tokens: " + error.message;
      }
      alert(errorMessage);
      setadminClaim(false);
    }
  };

  const formEntriesHandler = (e) => {
    let key = e.currentTarget.name;
    let value = e.currentTarget.value;

    console.log(key, value);

    setFormEntry((formEntry) => ({
      ...formEntry,
      [key]: value,
    }));
  };

  const [formEntry, setFormEntry] = useState({
    adminAmount: "",
  });

  const resetFormEntry = () => {
    setFormEntry({
      adminAmount: "",
    });
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
                disabled={claiming}
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
          <h3 className="pt-[50px] text-lg  pb-2">Admin??. Claim here 👇</h3>

          <form>
            <div className="flex  pb-[32px] ">
            <input
                    type="number"
                    required
                    name="adminAmount"
                    value={formEntry.adminAmount}
                    onChange={formEntriesHandler}
                    className="border w-full rounded-l-md rounded-r-none py-2 px-3 text-gray-700 leading-tight "
                    placeholder="amount to claim"
                  />
              <button disabled={adminclaim} onClick={adminWithdraw} className="rounded-r-md rounded-l-none p-2 bg-[#9637eb]">
                Admin Only
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
