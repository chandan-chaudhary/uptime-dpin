import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PRIVATE_KEY  = process.env.PRIVATE_KEY as string;
export const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL as string;
export const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as string;


// THIS CODE SAMPLE ALLOW TO MAKE PAYMNET WITHOUT CONFIRATION FROM WALLET OWNER
// USE IT ONLY FOR TESTING PURPOSES AND NEVER IN PRODUCTION
  // const provider = new ethers.JsonRpcProvider(RPC_URL);
  // const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  // const publicKey = wallet.address;
  // // Contract address (replace with your deployed address)
  // const contractAddress = PAYMENT_CONTRACT_ADDRESS;
  // const contract = new ethers.Contract(contractAddress, paymentAbi.abi, wallet);

  // try {
  //   // Call receivePayment on contract
  //   const tx = await contract.receivePayment(
  //     publicKey,
  //     ethers.parseEther(amountEth.toString()),
  //     {
  //       value: ethers.parseEther(amountEth.toString()),
  //     }
  //   );
  //   const receipt = await tx.wait();
  //   console.log(receipt, 'from transaction');
    