"use client";
import { useState, useContext } from "react";
import { DAppContext } from "@/context";

export default function WhiteList() {

  const { walletConnected, setWalletConnected } = useContext(DAppContext);

  const [pending, setPending] = useState(false);

  const [formEntries, setFormEntries] = useState({
    whiteList: "",
  });

  const formEntriesHandler = (e) => {
    let key = e.currentTarget.name;
    let value = e.currentTarget.value;

    setFormEntries((formEntrys) => ({
      ...formEntrys,
      [key]: value,
    }));
  };

  return (
    <div className="grid w-full sm:w-full justify-items-center pt-[70px] pb-[150px]">
      <div className="pb-[100px] pt-[50px] text-center ">
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
      <form>
        <div className="flex flex-col pb-[32px]">
          <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
            Address to WhiteList
          </label>
          <input
            required
            name="name"
            value={formEntries.whiteList}
            onChange={formEntriesHandler}
            className="border rounded-lg w-full md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
            placeholder="WhiteList a vested Address"
          />
        </div>

        <div className="text-white font-bold ">
          <button
            disabled={!formEntries.amount}
            type="submit"
            className="py-2.5 bg-[#9637eb] rounded-3xl  w-full"
          >
            {pending ? "Whitelisting" : "WhiteList"}
          </button>
        </div>
      </form>
        )}
    </div>
  );
}
