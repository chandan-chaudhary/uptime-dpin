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
import { useSubscribe } from "@/hooks/useSubscribe";
import { PricingPlan, pricingPlans } from "@/hooks/pricingPlan";

export default function PricingSection() {
  const { subscribe, loading, currentPlan } = useSubscribe();

  async function handleSubscribe(plan: PricingPlan) {
    const result = await subscribe(plan);
    if (!result) {
      alert("Subscription failed. No response from subscription service.");
      return;
    }
    if (result.success) {
      alert(`Payment successful! TxHash: ${result.txHash}`);
      alert("Subscription recorded successfully.");
    } else {
      alert("Payment error: " + (result.error ?? "Unknown error"));
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
