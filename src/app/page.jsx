"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useContext, useState } from "react";
import { Contract, providers } from "ethers";
import Web3Modal from "web3modal";

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
  const web3ModalRef = useRef();

  const { walletConnected, setWalletConnected, account, setAccount, vested, setVested } =
    useContext(DAppContext);

  const getProvider = useCallback(async () => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const getSigner = web3Provider.getSigner();

    const { chainId } = await web3Provider.getNetwork();

    setAccount(await getSigner.getAddress());
    setWalletConnected(true);

    if (chainId !== CHAIN_ID) {
      window.alert(`Please switch to the ${NETWORK_NAME} network!`);
      throw new Error(`Please switch to the ${NETWORK_NAME} network`);
    }
    setProvider(web3Provider);
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
    return signer;
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
    return new Contract(
      VESTING_CONTRACT_ADDRESS,
      VESTING_ABI,
      providerOrSigner
    );
  }, []);

  const getTokenContractInstance = useCallback((providerOrSigner) => {
    try {
        return new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, providerOrSigner);
    } catch (error) {
        console.error('Error creating token contract instance:', error);
        return null;
    }
}, []);

const approveToken = async (e) => {
  try {
      const signer = await getSigner();
      console.log('signer', signer);
      const tokenContract = getTokenContractInstance(signer);
      console.log('tokenContract', tokenContract)
      
      const approve = await tokenContract.approve(VESTING_CONTRACT_ADDRESS, formEntries.amount);
      console.log("approve", approve);
      return approve; // Return the result if needed
  } catch (error) {
      console.error('Error approving tokens:', error);
      throw error; // Re-throw the error to propagate it to the caller
  }
}

const createVestingSchedule = async (e) => {
  e.preventDefault();
  const epochTime = dateToEpoch(formEntries.vestingDuration);
  console.log('Epoch Time:', epochTime);
  
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
      setLoading(true);
      const vestingContract = getVestingContractInstance(signer);
      console.log("vesting Instance", vestingContract);

      const tx = await vestingContract.createVestingSchedule(
        formEntries.organisationName,
        formEntries.description,
        formEntries.selectedButtonValue,
        epochTime,
        formEntries.beneficiary,
        formEntries.amount
      );
      
      await tx.wait();
      console.log('created vesting', tx);

      alert("Vesting Schedule created successfully");

      setLoading(false);
      setVested(true);
    } catch (error) {
      console.error('Error creating vesting schedule:', error);
      setLoading(false);
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

  const resetFormEntries = () => {
    setFormEntries({
      name: "",
      email: "",
      message: "",
    });
    return setMsgSent(false);
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

  const [loading, setLoading] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  return (
    <main className="bg-black">
      <div>
        <nav className="flex justify-between p-10">
          <h1 className="font-black  text-xl">VestingDapp</h1>
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="bg-[#9637eb] rounded-md p-4"
            >
              Connect wallet
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="bg-[#9637eb] rounded-md p-4"
            >
              Disconnect wallet
            </button>
          )}
        </nav>

        {!walletConnected ? (
          <h3 className="text-center mt-5">
            Please connect your wallet to proceed.
          </h3>
        ) : (
          <div className="mx-auto container">
            {/* form */}
            <div className="grid w-full sm:w-full justify-items-center pt-[70px] pb-[150px]">
              <form
                onSubmit={createVestingSchedule}
                className={!msgSent ? "fadeIn" : "fadeOut"}
              >
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
                      onClick={() => setFormEntries({ ...formEntries, selectedButtonValue: "0" })}
                      className="rounded-md p-2 bg-[#9637eb]"
                      style={{
                        backgroundColor:
                        formEntries.selectedButtonValue === "0" ? "lightblue" : "",
                      }}
                      required
                    >
                      None
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormEntries({ ...formEntries, selectedButtonValue: "1" })}
                      className="rounded-md p-2 bg-[#9637eb]"
                      style={{
                        backgroundColor:
                        formEntries.selectedButtonValue === "1" ? "lightblue" : "",
                      }}
                      required
                    >
                      Founder
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormEntries({ ...formEntries, selectedButtonValue: "2" })}
                      className="rounded-md p-2 bg-[#9637eb]"
                      style={{
                        backgroundColor:
                        formEntries.selectedButtonValue === "2" ? "lightblue" : "",
                      }}
                      required
                    >
                      Investor
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormEntries({ ...formEntries, selectedButtonValue: "3" })}
                      className="rounded-md p-2 bg-[#9637eb]"
                      style={{
                        backgroundColor:
                        formEntries.selectedButtonValue === "3" ? "lightblue" : "",
                      }}
                      required
                    >
                      Community
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormEntries({ ...formEntries, selectedButtonValue: "4" })}
                      className="rounded-md p-2 bg-[#9637eb]"
                      style={{
                        backgroundColor:
                        formEntries.selectedButtonValue === "4" ? "lightblue" : "",
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
                      !formEntries.amount || loading
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
