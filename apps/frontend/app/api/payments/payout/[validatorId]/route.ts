import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { ethers } from "ethers";
import paymentAbi from "@/lib/Payment_abi.json";
import { PAYMENT_CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL } from "@/lib/utils";

// GET: Fetch pending payout for a validator
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ validatorId: string }> }
) {
  const { validatorId } = await context.params;

  if (!validatorId) {
    return NextResponse.json({ error: "Missing validatorId" }, { status: 400 });
  }

  try {
    // Fetch validator info
    const validator = await prisma.validator.findUnique({
      where: { id: validatorId },
      select: {
        id: true,
        publicKey: true,
        pendingPayout: true,
        createdAt: true,
      },
    });

    if (!validator) {
      return NextResponse.json(
        { error: "Validator not found" },
        { status: 404 }
      );
    }

    // Convert pendingPayout from gwei to ETH
    const pendingPayoutEth = Number(validator.pendingPayout) / 1e9;

    return NextResponse.json({
      validatorId: validator.id,
      publicKey: validator.publicKey,
      pendingPayout: {
        gwei: validator.pendingPayout,
        eth: pendingPayoutEth,
      },
      createdAt: validator.createdAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Dynamic route: /api/payout/[validatorId]/route.ts
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ validatorId: string }> }
) {
  const { validatorId } = await context.params;
  if (!validatorId) {
    return NextResponse.json({ error: "Missing validatorId" }, { status: 400 });
  }
  try {
    // Fetch validator info
    const validator = await prisma.validator.findUnique({
      where: { id: validatorId },
      select: { publicKey: true, pendingPayout: true },
    });
    if (!validator) {
      return NextResponse.json(
        { error: "Validator not found" },
        { status: 404 }
      );
    }
    if (validator.pendingPayout <= 0) {
      return NextResponse.json({ error: "No pending payout" }, { status: 400 });
    }
    console.log(validator, "in route");

    // Pay validator using contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      PAYMENT_CONTRACT_ADDRESS,
      paymentAbi.abi,
      wallet
    );
    // Convert pendingPayout (gwei) to ETH
    const payoutAmountEth = Number(validator.pendingPayout) / 1e9;
    console.log("paying", payoutAmountEth);

    let txHash = "";
    try {
      const tx = await contract.payValidator(validator.publicKey, {
        value: ethers.parseEther(payoutAmountEth.toString()),
      });
      const receipt = await tx.wait();
      txHash = receipt.hash;
    } catch (err) {
      return NextResponse.json(
        { error: "Contract transaction failed", details: String(err) },
        { status: 500 }
      );
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        validatorId,
        amount: payoutAmountEth,
        currency: "ETH",
        status: "Completed",
        requestedAt: new Date(),
        processedAt: new Date(),
        txHash,
      },
    });
    // Update validator pendingPayout to 0
    await prisma.validator.update({
      where: { id: validatorId },
      data: { pendingPayout: 0 },
    });
    return NextResponse.json({ success: true, payout });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
