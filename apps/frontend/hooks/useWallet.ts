import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}
export async function connectWallet(): Promise<{
  provider: ethers.BrowserProvider;
  signer: ethers.Signer;
  publicKey: string;
} | null> {
  if (!window.ethereum) {
    alert("No wallet found!");
    return null;
  }
  try {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const publicKey = await signer.getAddress();
    
    return { provider, signer, publicKey };
  } catch (err) {
    alert(
      "Wallet connection failed: " +
        (err instanceof Error ? err.message : String(err))
    );
    return null;
  }
}

export function useWallet() {
  return { connectWallet };
}
