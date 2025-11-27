"use client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ethers } from "ethers";
import paymentAbi from "@/lib/Payment_abi.json";
import { useState } from "react";
import { PAYMENT_CONTRACT_ADDRESS } from "@/lib/utils";
import axios from "axios";

export interface PricingPlan {
  id: string;
  title: string;
  description: string;
  priceEth: number;
  isPopular?: boolean;
  features: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    title: "Starter",
    description: "Perfect for small projects",
    priceEth: 0.01,
    features: [
      "5 monitors",
      "1-minute checks",
      "Email alerts",
      "30-day history",
    ],
  },
  {
    id: "professional",
    title: "Professional",
    description: "For growing businesses",
    priceEth: 0.05,
    isPopular: true,
    features: [
      "25 monitors",
      "30-second checks",
      "All alert channels",
      "1-year history",
      "SSL monitoring",
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    description: "For large organizations",
    priceEth: 0.1,
    features: [
      "Unlimited monitors",
      "10-second checks",
      "Priority support",
      "Unlimited history",
      "Custom integrations",
    ],
  },
];

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

export default function PricingSection() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  async function handleSubscribe(plan: PricingPlan) {
    setLoading(true);
    setCurrentPlan(plan.id);
    let txHash: string | null = null;
    let status = "Pending";
    try {
      const wallet = await connectWallet();
      if (!wallet) {
        setLoading(false);
        return;
      }
      const { signer, publicKey } = wallet;
      const contractAddress = PAYMENT_CONTRACT_ADDRESS;
      if (
        !contractAddress ||
        contractAddress === "" ||
        contractAddress === "null"
      ) {
        alert("Payment contract address is not set. Please contact support.");
        setLoading(false);
        return;
      }
      const contract = new ethers.Contract(
        contractAddress,
        paymentAbi.abi,
        signer
      );
      // Prompt wallet for confirmation
      try {
        const tx = await contract.receivePayment(
          publicKey,
          ethers.parseEther(plan.priceEth.toString()),
          { value: ethers.parseEther(plan.priceEth.toString()) }
        );
        const receipt = await tx.wait();
        txHash = receipt.hash;
        status = "Paid";
        alert(`Payment successful! TxHash: ${txHash}`);
      } catch (walletErr) {
        status = "Failed";
        const walletErrMessage =
          walletErr instanceof Error ? walletErr.message : String(walletErr);
        alert("Payment cancelled or failed: " + walletErrMessage);
      }
      // Send txHash and details to backend using axios
      const res = await axios.post(
        "/api/pay",
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
          alert(`Backend update failed: ${data?.error ?? "Unknown error"}`);
        }
        alert("Subscription recorded successfully.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Payment error: " + message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Simple Pricing</h2>
        <p className="text-xl text-slate-100">
          Choose the plan that fits your needs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={
              plan.id === "professional"
                ? "hover:shadow-xl transition-shadow border-emerald-500 border-2 relative"
                : "hover:shadow-xl transition-shadow"
            }
          >
            {plan.isPopular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.priceEth} ETH</span>
                <span className="text-slate-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6"
                onClick={() => handleSubscribe(plan)}
                disabled={loading && plan.id === currentPlan}
              >
                {loading && plan.id === currentPlan
                  ? "Processing..."
                  : "Get Started"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
