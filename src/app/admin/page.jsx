"use client";
import { useState } from "react";

export default function Admin() {

  const [processing, setProcessing] = useState(false);

  const [formEntries, setFormEntries] = useState({
    amount: "",
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
    <div className="grid w-full sm:w-full justify-items-center pt-[140px] pb-[150px]">
      <form>
        <div className="flex flex-col pb-[32px]">
          <label className="pb-[7px] text-center text-white text-sm sm:text-base font-semibold leading-snug">
            Withdraw by Admin
          </label>
          <input
            required
            name="amount"
            type="number"
            value={formEntries.amount}
            onChange={formEntriesHandler}
            className="border rounded-lg w-full md:w-[600px] py-3 px-3 text-gray-700 leading-tight "
            placeholder="Amount to withdraw"
          />
        </div>

        <div className="text-white font-bold ">
                <button
                  disabled={!formEntries.amount}
                  type="submit"
                  className="py-2.5 bg-[#9637eb] rounded-3xl  w-full"
                >
                  {processing ? "Withdrawing" : "Withdraw"}
                </button>
              </div>
      </form>
    </div>
  );
}
