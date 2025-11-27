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
import { connectWallet } from "@/components/PricingSection";

export default function AdminPage() {
  const [owner, setOwner] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [newOwner, setNewOwner] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [connectedAddress, setConnectedAddress] = useState<string>("");

  // async function connectWallet() {
  //   setMessage("");
  //   try {
  //     if (!window.ethereum) throw new Error("No wallet found!");
  //     // Use wallet_requestPermissions to force account selection
  //     await window.ethereum.request({
  //       method: "wallet_requestPermissions",
  //       params: [{ eth_accounts: {} }],
  //     });
  //     const accounts = await window.ethereum.request({
  //       method: "eth_accounts",
  //     });
  //     if (accounts && accounts.length > 0) {
  //       setConnectedAddress(accounts[0]);
  //       setMessage("Wallet connected: " + accounts[0]);
  //     } else {
  //       setMessage("No wallet address returned.");
  //     }
  //   } catch (err) {
  //     setMessage(err instanceof Error ? err.message : String(err));
  //   }
  // }

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
    <div className="max-w-4xl mx-auto mt-12 min-h-screen">
      <div className="flex justify-end mb-6 gap-4">
        {connectedAddress ? (
          <>
            <Button
              onClick={disconnectWallet}
              className="bg-red-600 text-white px-6 py-2 rounded"
            >
              Disconnect Wallet
            </Button>
            <Button
              onClick={connectWallet}
              className="bg-emerald-600 text-white px-6 py-2 rounded"
            >
              {`Connected: ${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`}
            </Button>
          </>
        ) : (
          <Button
            onClick={connectWallet}
            className="bg-emerald-600 text-white px-6 py-2 rounded"
          >
            Connect Wallet
          </Button>
        )}
      </div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-4">Admin Controls</h2>
        <p className="text-xl text-slate-100">
          Manage contract owner and withdrawals
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Only contract owner can withdraw</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-slate-300 mb-2">Amount (ETH)</label>
              <input
                type="number"
                min="0"
                step="any"
                className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount}
            >
              {loading ? "Processing..." : "Withdraw"}
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Change Owner</CardTitle>
            <CardDescription>
              Only contract owner can change owner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-slate-300 mb-2">
                New Owner Address
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Enter new owner address"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleChangeOwner}
              disabled={loading || !newOwner}
            >
              {loading ? "Processing..." : "Change Owner"}
            </Button>
          </CardContent>
        </Card>
      </div>
      {message && (
        <div className="mt-8 text-center text-lg text-emerald-400">
          {message}
        </div>
      )}
    </div>
  );
}
