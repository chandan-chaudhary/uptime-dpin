import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import paymentAbi from "@/lib/Payment_abi.json";
import { PAYMENT_CONTRACT_ADDRESS } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { PricingPlan } from "./pricingPlan";

export function useSubscribe() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { connectWallet } = useWallet();

  async function subscribe(plan: PricingPlan) {
    setLoading(true);
    setCurrentPlan(plan.id);
    let txHash: string | null = null;
    let status = "Pending";
    try {
      const wallet = await connectWallet();
      if (!wallet) {
        setLoading(false);
        return { success: false, error: "Wallet not connected" };
      }
      const { signer, publicKey } = wallet;
      const contractAddress = PAYMENT_CONTRACT_ADDRESS;
      if (
        !contractAddress ||
        contractAddress === "" ||
        contractAddress === "null"
      ) {
        setLoading(false);
        return {
          success: false,
          error: "Payment contract address is not set.",
        };
      }
      const contract = new ethers.Contract(
        contractAddress,
        paymentAbi.abi,
        signer
      );
      try {
        const tx = await contract.receivePayment(
          publicKey,
          ethers.parseEther(plan.priceEth.toString()),
          { value: ethers.parseEther(plan.priceEth.toString()) }
        );
        const receipt = await tx.wait();
        txHash = receipt.hash;
        status = "Paid";
      } catch (walletErr) {
        status = "Failed";
        setLoading(false);
        return {
          success: false,
          error:
            walletErr instanceof Error ? walletErr.message : String(walletErr),
        };
      }
      // Send txHash and details to backend using axios
      const res = await axios.post(
        "/api/payments/pay",
        {
          planId: plan.id,
          amountEth: plan.priceEth,
          txHash,
          publicKey,
          status,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res) throw new Error("No response from backend");
      if (res.status === 200 && res.data) {
        const data = res.data;
        if (!data?.success) {
          setLoading(false);
          return { success: false, error: data?.error ?? "Unknown error" };
        }
        setLoading(false);
        return { success: true, txHash };
      }
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      setLoading(false);
    }
  }

  return { subscribe, loading, currentPlan };
}
