import Link from "next/link";

export default function Claim() {
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
        <div className="flex flex-col pb-[12px]">
          <button className="rounded-md p-2 bg-[#9637eb]">Claim here </button>
        </div>
      </form>

      <h1 className="text-4xl text-gray-500 py-6 font-black">OR</h1>

      <div className="">
          <h3 className="pt-[50px] text-lg  pb-2">Admin?, Claim here 👇</h3>

          <form>
        <div className="flex  pb-[32px] ">
          <input type="text" className="rounded" placeholder="Admin withdraw" />
          <button className="rounded-md p-2 bg-[#9637eb]">Admin Only</button>
        </div>
      </form>
      </div>
    </div>
    </>
  );
}
