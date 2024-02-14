"use client";

import { useCallback, useRef, useContext, useState } from "react";
import { Contract, providers } from "ethers";
import Web3Modal from "web3modal";
import Link from "next/link";
import { useRouter } from "next/router";
import { ethers } from "ethers";

import { DAppContext } from "@/context";

import {
  VESTING_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS,
  VESTING_ABI,
  TOKEN_ABI,
} from "@/contract";

export default function Home() {
  const CHAIN_ID = 11155111;
  const NETWORK_NAME = "Sepolia";

  const [provider, setProvider] = useState(null);

  // const web3ModalRef = useRef("");

  const web3ModalRef = useRef(() => new Web3Modal());

  const {
    walletConnected,
    setWalletConnected,
    account,
    setAccount,
    vested,
    setVested,
  } = useContext(DAppContext);

  const getProvider = useCallback(async () => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const getSigner = web3Provider.getSigner();

    const { chainId } = await web3Provider.getNetwork();

    setAccount(await getSigner.getAddress());
    setWalletConnected(true);

    if (chainId !== CHAIN_ID) {
      alert(`Please switch to the ${NETWORK_NAME} network!`);
      throw new Error(`Please switch to the ${NETWORK_NAME} network`);
    }
    setProvider(web3Provider);
  }, []);

  // Helper function to fetch a Signer instance from MetaMask
  const getSigner = useCallback(async () => {
    try {
      if (typeof window.ethereum === "undefined") {
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

  const connectWallet = useCallback(async () => {
    try {
      web3ModalRef.current = new Web3Modal({
        network: NETWORK_NAME,
        providerOptions: {},
        disableInjectedProvider: false,
      });

      await getProvider();
    } catch (error) {
      console.error(error);
    }
  }, [getProvider]);

  const disconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setAccount("");

    web3ModalRef.current = null;
  }, [setWalletConnected, setAccount]);

  // Helper function to return a Todo Contract instance
  // given a Provider/Signer

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

  const getTokenContractInstance = useCallback((providerOrSigner) => {
    try {
      return new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, providerOrSigner);
    } catch (error) {
      console.error("Error creating token contract instance:", error);
      return null;
    }
  }, []);

  const approveToken = async (e) => {
    try {
      const signer = await getSigner();
      console.log("signer", signer);
      const tokenContract = getTokenContractInstance(signer);
      console.log("tokenContract", tokenContract);

      const approve = await tokenContract.approve(
        VESTING_CONTRACT_ADDRESS,
        formEntries.amount
      );
      console.log("approve", approve);
      return approve; // Return the result if needed
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error; // Re-throw the error to propagate it to the caller
    }
  };

  const mintToken = async (e) => {
    e.preventDefault();
    try {
      setMinting(true);
      const signer = await getSigner();
      console.log("signer", signer);
      const tokenContract = getTokenContractInstance(signer);
      console.log("tokenContract", tokenContract);

      const Mint = await tokenContract.mint(
        mintEntries.accountMinter,
        mintEntries.amountMinter
      );
      console.log("Mint", Mint);
      alert("Minted successfully");
      setMinting(false);
      resetMintEntries();
    } catch (error) {
      setMinting(false);
      alert("Error Minting", error);
      throw error; // Re-throw the error to propagate it to the caller
    }
  };

  const createVestingSchedule = async (e) => {
    e.preventDefault();
    const epochTime = dateToEpoch(formEntries.vestingDuration);
    console.log("Epoch Time:", epochTime);

    if (
      !formEntries.organisationName ||
      !formEntries.description ||
      !formEntries.selectedButtonValue ||
      !epochTime ||
      !formEntries.beneficiary ||
      !formEntries.amount
    ) {
      alert("Please fill all fields");
      return;
    } else {
      try {
        await approveToken();

        const signer = await getSigner();
        console.log("signer", signer);
        setLoading(true);
        const vestingContract = getVestingContractInstance(signer);
        console.log("vesting Instance", vestingContract);

        const tx = await vestingContract.createVestingSchedule(
          formEntries.amount,
          formEntries.beneficiary,
          formEntries.selectedButtonValue,
          epochTime,
          formEntries.organisationName,
          formEntries.description
        );

        await tx.wait();
        console.log("created vesting", tx);

        setLoading(false);
        setWhitelist(true);
        alert("Vesting Schedule created successfully");
        resetFormEntries();
      } catch (error) {
        alert("Error creating vesting schedule:", error);
        setLoading(false);
        setWhitelist(false);
        // Handle error appropriately, e.g., display an error message to the user
        // You can also re-throw the error if you want to propagate it further
      }
    }
  };

  const resetButtonStyles = () => {
    // Reset the background color of all buttons
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      button.style.backgroundColor = "";
    });
  };

  // Function to convert datetime to epoch
  const dateToEpoch = (dateString) => {
    const myDate = new Date(dateString);
    const epochTime = myDate.getTime() / 1000.0;
    return epochTime;
  };

  const [formEntries, setFormEntries] = useState({
    organisationName: "",
    description: "",
    selectedButtonValue: "",
    vestingDuration: "",
    beneficiary: "",
    amount: "",
  });

  const [mintEntries, setMintEntries] = useState({
    accountMinter: "",
    amountMinter: "",
  });

  const resetFormEntries = () => {
    setFormEntries({
      organisationName: "",
      description: "",
      selectedButtonValue: "",
      vestingDuration: "",
      beneficiary: "",
      amount: "",
    });
    return setWhitelist(true);
  };

  const resetMintEntries = () => {
    setFormEntries({
      accountMinter: "",
      amountMinter: "",
    });
  };

  const formEntriesHandler = (e) => {
    let key = e.currentTarget.name;
    let value = e.currentTarget.value;

    console.log(key, value);

    setFormEntries((formEntrys) => ({
      ...formEntrys,
      [key]: value,
    }));
  };

  const formMintHandler = (e) => {
    let key = e.currentTarget.name;
    let value = e.currentTarget.value;

    console.log(key, value);

    setMintEntries((mintEntries) => ({
      ...mintEntries,
      [key]: value,
    }));
  };

  const [minting, setMinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whitelist, setWhitelist] = useState(false);

  // FOR WHITELIST VERSION

  const [pending, setPending] = useState(false);
  const [whitelisted, setWhiteListed] = useState(false);

  const [whiteListFormEntries, setWhiteListFormEntries] = useState({
    whiteList: "",
  });

  const whitelistVestedAddress = async (e) => {
    e.preventDefault();

    if (!whiteListFormEntries.whiteList) {
      alert("Please fill field");
      return;
    } else {
      try {
        const signer = await getSigner();
        console.log("signer", signer);
        setPending(true);
        const vestingContract = getVestingContractInstance(signer);
        console.log("whiteListing Instance", vestingContract);

        const tx = await vestingContract.whitelistAddress(
          whiteListFormEntries.whiteList
        );

        await tx.wait();
        console.log("created whiteList", tx);

        setPending(false);

        alert("Address whitelisted successfully");
        resetWhiteListFormEntries();
      } catch (error) {
        let errorMessage;
        if (error.message.includes("Address is already whitelisted ")) {
          errorMessage = "Address is already whitelisted ";
        } else {
          errorMessage = "Error whitelisting, refresh: " + error.message;
        }
        alert(errorMessage);
        setPending(false);
      }
    }
  };

  const formWhiteListEntriesHandler = (e) => {
    let key = e.currentTarget.name;
    let value = e.currentTarget.value;

    setWhiteListFormEntries((formEntrys) => ({
      ...formEntrys,
      [key]: value,
    }));
  };

  const resetWhiteListFormEntries = () => {
    setWhiteListFormEntries({
      whiteList: "",
    });
    return setWhiteListed(true);
  };

  return (
    <main className="bg-black">
      <div>
        <nav className="flex justify-between p-10">
          <h1 className="text-white font-black  text-xl">VDapp</h1>
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="bg-[#9637eb] text-white rounded-md p-4"
            >
              Connect wallet
            </button>
          ) : (
            <div className="flex justify-between gap-4 sm:gap-[100px]">
              <Link href={"/claim"}>
                <h3 className="text-bold sm:text-xl pt-[8px]">Claim Tokens</h3>
              </Link>
              <button
                onClick={disconnectWallet}
                className="bg-[#9637eb] rounded-md p-4"
              >
                Disconnect wallet
              </button>
            </div>
          )}
        </nav>

        {!walletConnected ? (
          <div>
            <h3 className="text-center pt-[30px] sm:pt-[0px] text-white text-3xl sm:text-4xl font-bold leading-loose px-[100px] sm:mt-[90px]">
              Welcome to <span className="text-[#9677eb]">VDApp</span> the
              decentralized vesting platform <br />
              <br />
            </h3>

            <p className="text-center px-[30px] pb-[30px] text-gray-300 pt-[50px]">
              To Interact with this Dapp, <br />
              you need to have{" "}
              <span className="text-[#9677eb]">sepolia Eth </span>for gasFee and
              <br />
              you need to be airdropped Some
              <span className="text-[#9679eb]">VTokens too</span>
              <br /> Mint some tokens now!
              <br />
              <br />
              <span className="text-[13px]">TOKEN CA: <br /> 0x4469199279E1910c508CF9FD0d1D873755831131</span>
              
            </p>

            <form onSubmit={mintToken}>
              <div className="grid w-full sm:w-full justify-items-center pt-[70px] pb-[150px]">
                <div className="flex flex-col pb-[32px]">
                  <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                    Address to be airdropped
                  </label>
                  <input
                    required
                    name="accountMinter"
                    value={mintEntries.accountMinter}
                    onChange={formMintHandler}
                    className="border rounded-lg w-full md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
                    placeholder="input your eth address"
                  />
                </div>

                <div className="flex flex-col pb-[32px]">
                  <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                    Amount
                  </label>
                  <input
                    required
                    name="amountMinter"
                    value={mintEntries.amountMinter}
                    onChange={formMintHandler}
                    className="border rounded-lg w-full md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
                    placeholder="any number, 0-300"
                  />
                </div>

                <div className="text-white font-bold ">
                  <button
                    disabled={minting}
                    type="submit"
                    className={"py-3 px-5 bg-[#9637eb] rounded-md w-full"}
                  >
                    {minting ? "minting" : "Mint"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="mx-auto container">
            {/* form */}
            <div className="grid w-full sm:w-full justify-items-center pt-[70px] pb-[150px]">
              {!whitelist ? (
                <form onSubmit={createVestingSchedule}>
                  <div className="flex flex-col pb-[32px]">
                    <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                      Name of organisation
                    </label>
                    <input
                      required
                      name="organisationName"
                      value={formEntries.organisationName}
                      onChange={formEntriesHandler}
                      className="border rounded-lg w-full md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
                      placeholder="Name of organisation"
                    />
                  </div>

                  <div className="flex flex-col pb-[32px]">
                    <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                      Description
                    </label>
                    <textarea
                      required
                      name="description"
                      value={formEntries.description}
                      onChange={formEntriesHandler}
                      className="border rounded-lg w-full  md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
                      placeholder="a short Org description"
                    />
                  </div>

                  <div className="flex flex-col pb-[32px]">
                    <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                      Stakeholder Type
                    </label>

                    {/* stake button */}
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setFormEntries({
                            ...formEntries,
                            selectedButtonValue: "0",
                          })
                        }
                        className="rounded-md p-2 bg-[#9637eb]"
                        style={{
                          backgroundColor:
                            formEntries.selectedButtonValue === "0"
                              ? "lightblue"
                              : "",
                        }}
                        required
                      >
                        None
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormEntries({
                            ...formEntries,
                            selectedButtonValue: "1",
                          })
                        }
                        className="rounded-md p-2 bg-[#9637eb]"
                        style={{
                          backgroundColor:
                            formEntries.selectedButtonValue === "1"
                              ? "lightblue"
                              : "",
                        }}
                        required
                      >
                        Founder
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormEntries({
                            ...formEntries,
                            selectedButtonValue: "2",
                          })
                        }
                        className="rounded-md p-2 bg-[#9637eb]"
                        style={{
                          backgroundColor:
                            formEntries.selectedButtonValue === "2"
                              ? "lightblue"
                              : "",
                        }}
                        required
                      >
                        Investor
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormEntries({
                            ...formEntries,
                            selectedButtonValue: "3",
                          })
                        }
                        className="rounded-md p-2 bg-[#9637eb]"
                        style={{
                          backgroundColor:
                            formEntries.selectedButtonValue === "3"
                              ? "lightblue"
                              : "",
                        }}
                        required
                      >
                        Community
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormEntries({
                            ...formEntries,
                            selectedButtonValue: "4",
                          })
                        }
                        className="rounded-md p-2 bg-[#9637eb]"
                        style={{
                          backgroundColor:
                            formEntries.selectedButtonValue === "4"
                              ? "lightblue"
                              : "",
                        }}
                        required
                      >
                        PreSale
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col pb-[32px]">
                    <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                      Vesting Duration
                    </label>
                    <input
                      required
                      name="vestingDuration"
                      type="datetime-local"
                      value={formEntries.vestingDuration}
                      onChange={formEntriesHandler}
                      className="border rounded-lg w-[400px] sm:w-[600px] py-3 px-3 text-gray-700 leading-tight "
                    />
                  </div>

                  <div className="flex flex-col pb-[32px]">
                    <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                      Beneficiary Address
                    </label>
                    <input
                      required
                      name="beneficiary"
                      value={formEntries.beneficiary}
                      onChange={formEntriesHandler}
                      className="border rounded-lg w-full md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
                      placeholder="Address of beneficiary"
                    />
                  </div>

                  <div className="flex flex-col pb-[32px]">
                    <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                      Amount to vest
                    </label>
                    <input
                      required
                      name="amount"
                      type="number"
                      value={formEntries.amount}
                      onChange={formEntriesHandler}
                      className="border rounded-lg w-full md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
                      placeholder="Input number of tokens to vest"
                    />
                  </div>

                  <div className="text-white font-bold ">
                    <button
                      disabled={
                        !formEntries.description ||
                        !formEntries.organisationName ||
                        !formEntries.selectedButtonValue ||
                        !formEntries.vestingDuration ||
                        !formEntries.beneficiary ||
                        !formEntries.amount ||
                        loading
                      }
                      type="submit"
                      className={`py-2.5 rounded-3xl w-full ${
                        !loading && !formEntries.amount
                          ? "bg-[#CCCCCC] cursor-not-allowed"
                          : "bg-[#9637eb] hover:bg-[#842fc1] active:bg-[#731f9e]"
                      }`}
                    >
                      {loading ? "Vesting" : "Vest Now"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid w-full sm:w-full justify-items-center pb-[150px]">
                  <div className="pb-[100px] pt-[0px] text-center ">
                    <h3 className="pb-3 font-bold text-xl">
                      Whitelist your beneficiary vested address now
                    </h3>
                    <p className="text-gray-400">
                      Only whitelisted address can claim tokens
                    </p>
                  </div>

                  {!walletConnected ? (
                    <h3 className="text-center mt-5">
                      Please connect your wallet to proceed.
                    </h3>
                  ) : (
                    <form onSubmit={whitelistVestedAddress}>
                      <div className="flex flex-col pb-[32px]">
                        <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                          Address to WhiteList
                        </label>
                        <input
                          required
                          name="whiteList"
                          type="text"
                          value={whiteListFormEntries.whiteList}
                          onChange={formWhiteListEntriesHandler}
                          className="border rounded-lg w-full md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
                          placeholder="WhiteList a vested Address"
                        />
                      </div>

                      <div className="text-white font-bold ">
                        <button
                          disabled={!whiteListFormEntries.whiteList || pending}
                          type="submit"
                          className="py-2.5 bg-[#9637eb] rounded-3xl  w-full"
                        >
                          {pending ? "Whitelisting" : "WhiteList"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
