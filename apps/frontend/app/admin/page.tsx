"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import paymentAbi from "@/lib/Payment_abi.json";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PAYMENT_CONTRACT_ADDRESS } from "@/lib/utils";
import { connectWallet } from "@/hooks/useWallet";
import { ManualPayoutTrigger } from "@/components/ManualPayoutTrigger";

export default function AdminPage() {
  const [owner, setOwner] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [newOwner, setNewOwner] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [connectedAddress, setConnectedAddress] = useState<string>("");

  async function handleConnectWallet() {
    try {
      const wallet = await connectWallet();
      if (!wallet) {
        setMessage("Wallet connection failed.");
        return;
      }
      // const signer = wallet.signer;
      const address = wallet.publicKey;
      setConnectedAddress(address);
      setMessage("Wallet connected: " + address);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  function disconnectWallet() {
    setConnectedAddress("");
    setMessage("Wallet disconnected.");
  }

  async function fetchOwner() {
    try {
      if (!window.ethereum) throw new Error("No wallet found!");
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const contractAddress = PAYMENT_CONTRACT_ADDRESS;
      if (
        !contractAddress ||
        contractAddress === "" ||
        contractAddress === "null" ||
        typeof contractAddress === "undefined"
      ) {
        setMessage(
          "Payment contract address is not set. Please contact support."
        );
        return;
      }
      const contract = new ethers.Contract(
        contractAddress,
        paymentAbi.abi,
        provider
      );
      const ownerAddress = await contract.getOwner();
      setOwner(ownerAddress);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }
  console.log(owner);

  useEffect(() => {
    fetchOwner();
  }, []);

  async function handleWithdraw() {
    setLoading(true);
    setMessage("");
    try {
      if (!window.ethereum) throw new Error("No wallet found!");
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      // Prompt wallet connection every time
      await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!connectedAddress) {
        setMessage("Please connect your wallet first.");
        setLoading(false);
        return;
      }
      const signer = await provider.getSigner();
      const userAddr = connectedAddress;
      if (userAddr.toLowerCase() !== owner.toLowerCase()) {
        setMessage("Only the contract owner can withdraw.");
        setLoading(false);
        return;
      }
      const contractAddress = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS;
      if (
        !contractAddress ||
        contractAddress === "" ||
        contractAddress === "null" ||
        typeof contractAddress === "undefined"
      ) {
        setMessage(
          "Payment contract address is not set. Please contact support."
        );
        setLoading(false);
        return;
      }
      const contract = new ethers.Contract(
        contractAddress,
        paymentAbi.abi,
        signer
      );
      const tx = await contract.withdraw(ethers.parseEther(withdrawAmount));
      await tx.wait();
      setMessage("Withdrawal successful!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeOwner() {
    setLoading(true);
    setMessage("");
    try {
      if (!window.ethereum) throw new Error("No wallet found!");
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      // Prompt wallet connection every time
      await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!connectedAddress) {
        setMessage("Please connect your wallet first.");
        setLoading(false);
        return;
      }
      const signer = await provider.getSigner();
      const userAddr = connectedAddress;
      if (userAddr.toLowerCase() !== owner.toLowerCase()) {
        setMessage("Only the contract owner can change owner.");
        setLoading(false);
        return;
      }
      const contractAddress = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS;
      if (
        !contractAddress ||
        contractAddress === "" ||
        contractAddress === "null" ||
        typeof contractAddress === "undefined"
      ) {
        setMessage(
          "Payment contract address is not set. Please contact support."
        );
        setLoading(false);
        return;
      }
      const contract = new ethers.Contract(
        contractAddress,
        paymentAbi.abi,
        signer
      );
      const tx = await contract.changeOwner(newOwner);
      await tx.wait();
      setMessage("Owner changed successfully!");
      setOwner(newOwner);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-end mb-6 gap-4">
        {connectedAddress ? (
          <>
            <Button
              onClick={disconnectWallet}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              Disconnect Wallet
            </Button>
            <Button
              onClick={handleConnectWallet}
              className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30"
            >
              {`Connected: ${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleConnectWallet}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Connect Wallet
          </Button>
        )}
      </div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-slate-100 mb-4">
          Admin Controls
        </h2>
        <p className="text-xl text-slate-400">
          Manage contract owner and withdrawals
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-slate-800 bg-slate-900/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
          <CardHeader>
            <CardTitle className="text-slate-100">Withdraw Funds</CardTitle>
            <CardDescription className="text-slate-400">
              Only contract owner can withdraw
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Amount (ETH)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 text-white border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount}
            >
              {loading ? "Processing..." : "Withdraw"}
            </Button>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
          <CardHeader>
            <CardTitle className="text-slate-100">Change Owner</CardTitle>
            <CardDescription className="text-slate-400">
              Only contract owner can change owner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                New Owner Address
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 text-white border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Enter new owner address"
              />
            </div>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={handleChangeOwner}
              disabled={loading || !newOwner}
            >
              {loading ? "Processing..." : "Change Owner"}
            </Button>
          </CardContent>
        </Card>
      </div>
      {message && (
        <div
          className={`mt-8 text-center text-lg p-4 rounded-lg border ${
            message.includes("successful") || message.includes("connected")
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              : "bg-red-500/10 border-red-500/50 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      {/* Manual payout trigger for admin */}
      <div className="mt-12">
        <ManualPayoutTrigger />
      </div>
    </div>
  );
}
