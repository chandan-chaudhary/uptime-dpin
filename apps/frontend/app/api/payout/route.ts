import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function POST(request: NextRequest) {
  const { validatorId } = await request.json();
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
    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        validatorId,
        amount: validator.pendingPayout,
        currency: "ETH",
        status: "Processing",
        requestedAt: new Date(),
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
