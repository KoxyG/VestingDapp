"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const setButtonValue = (value) => {
    setSelectedButtonValue(value);
  };

  const resetButtonStyles = () => {
    // Reset the background color of all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      button.style.backgroundColor = '';
    });
  };

  const [formEntries, setFormEntries] = useState({
    name: "",
    email: "",
    message: "",
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

    setFormEntries((formEntrys) => ({
      ...formEntrys,
      [key]: value,
    }));
  };

  const formSubmitHandler = async (e) => {
    e.preventDefault();

    if (!selectedButtonValue) {
      alert('Please select a button before submitting.');
      return;
    }

    setLoading(true);

    try {
    } catch (error) {}
    let data = {
      ...formEntries,
    };
  };

  const [loading, setLoading] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [selectedButtonValue, setSelectedButtonValue] = useState(null);

  return (
    <main className="bg-black">
      <div>
        <nav className="flex justify-between p-10">
          <h1 className="font-black  text-xl">VestingDapp</h1>
          <button className="bg-[#9637eb] rounded-md p-4">
            Connect wallet
          </button>
        </nav>

        <div className="mx-auto container">
          {/* form */}
          <div className="grid w-full sm:w-full justify-items-center pt-[70px] pb-[150px]">
            <form
              onSubmit={formSubmitHandler}
              className={!msgSent ? "fadeIn" : "fadeOut"}
            >
              <div className="flex flex-col pb-[32px]">
                <label className="pb-[7px] text-white text-sm sm:text-base font-semibold leading-snug">
                  Name of organisation
                </label>
                <input
                  required
                  name="name"
                  value={formEntries.name}
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
                    onClick={() => setButtonValue("0")}
                    className="rounded-md p-2 bg-[#9637eb]"
                    style={{
                      backgroundColor:
                        selectedButtonValue === "0" ? "lightblue" : "",
                    }}
                    required
                  >
                    None
                  </button>

                  <button
                    type="button"
                    onClick={() => setButtonValue("1")}
                    className="rounded-md p-2 bg-[#9637eb]"
                    style={{
                      backgroundColor:
                        selectedButtonValue === "1" ? "lightblue" : "",
                    }}
                    required
                  >
                   Founder
                  </button>

                  <button
                    type="button"
                    onClick={() => setButtonValue("2")}
                    className="rounded-md p-2 bg-[#9637eb]"
                    style={{
                      backgroundColor:
                        selectedButtonValue === "2" ? "lightblue" : "",
                    }}
                    required
                  >
                   Investor
                  </button>

                  <button
                    type="button"
                    onClick={() => setButtonValue("3")}
                    className="rounded-md p-2 bg-[#9637eb]"
                    style={{
                      backgroundColor:
                        selectedButtonValue === "3" ? "lightblue" : "",
                    }}
                    required
                  >
                   Community
                  </button>

                  <button
                    type="button"
                    onClick={() => setButtonValue("4")}
                    className="rounded-md p-2 bg-[#9637eb]"
                    style={{
                      backgroundColor:
                        selectedButtonValue === "4" ? "lightblue" : "",
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
                  disabled={!formEntries.description || !formEntries.name}
                  type="submit"
                  className="py-2.5 bg-[#9637eb] rounded-3xl  w-full"
                >
                  {loading ? "Vesting" : "Vest Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
