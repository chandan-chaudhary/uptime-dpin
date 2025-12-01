import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUserId } from "@/lib/auth";
import { pricingPlans } from "@/hooks/pricingPlan";

export interface SubscriptionStatus {
  plan: "free" | "starter" | "professional" | "enterprise";
  isActive: boolean;
  expiresAt: string | null;
  amount: string | null;
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the latest paid invoice
    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        userId,
        status: "Paid",
      },
      orderBy: { paidAt: "desc" },
    });

    // If no invoice found, user is on free tier
    if (!latestInvoice || !latestInvoice.paidAt) {
      return NextResponse.json({
        plan: "free",
        isActive: true,
        expiresAt: null,
        amount: null,
      } as SubscriptionStatus);
    }

    // Calculate expiry (30 days from payment date)
    const paidDate = new Date(latestInvoice.paidAt);
    const expiryDate = new Date(paidDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    const now = new Date();
    const isActive = expiryDate > now;

    // Determine plan based on payment amount by matching with pricing plans
    const amount = parseFloat(latestInvoice.amount.toString());
    let plan: "free" | "starter" | "professional" | "enterprise" = "free";

    if (isActive) {
      // Find matching pricing plan based on amount
      const matchedPlan = pricingPlans.find(
        (p) => Math.abs(p.priceEth - amount) < 0.001
      );

      if (matchedPlan) {
        plan = matchedPlan.id as "starter" | "professional" | "enterprise";
      } else {
        // Fallback: match by closest amount
        if (amount >= 0.1) {
          plan = "enterprise";
        } else if (amount >= 0.05) {
          plan = "professional";
        } else if (amount >= 0.01) {
          plan = "starter";
        }
      }
    }

    return NextResponse.json({
      plan,
      isActive,
      expiresAt: expiryDate.toISOString(),
      amount: latestInvoice.amount.toString(),
    } as SubscriptionStatus);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
