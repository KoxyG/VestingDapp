export default function Claim() {
     return (
          <div className="grid w-full sm:w-full justify-items-center pt-[70px] pb-[150px]">
               
               <div className="pb-[100px] pt-[50px] text-center ">
               <h3 className="pb-3 font-bold text-xl">Tokens can only be claimed after vesting period has elapsed</h3>
               <p className="text-gray-400">Only whitelisted address can claim tokens</p>
               </div>

               <form>
                    <div className="flex flex-col pb-[32px]">
                        
                         <button className="rounded-md p-2 bg-[#9637eb]"
                    >Claim here</button>
                    </div>
               </form>
          </div>
     )
}