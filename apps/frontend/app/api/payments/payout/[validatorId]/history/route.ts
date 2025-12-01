import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET: Fetch all payout history for a validator
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ validatorId: string }> }
) {
  const { validatorId } = await context.params;

  if (!validatorId) {
    return NextResponse.json({ error: "Missing validatorId" }, { status: 400 });
  }

  try {
    // Check if validator exists
    const validator = await prisma.validator.findUnique({
      where: { id: validatorId },
      select: {
        id: true,
        publicKey: true,
      },
    });

    if (!validator) {
      return NextResponse.json(
        { error: "Validator not found" },
        { status: 404 }
      );
    }

    // Fetch all payouts for this validator, ordered by most recent first
    const payouts = await prisma.payout.findMany({
      where: { validatorId },
      orderBy: { processedAt: "desc" },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        requestedAt: true,
        processedAt: true,
        txHash: true,
      },
    });

    // Calculate total amount paid
    const totalPaid = payouts.reduce((sum, payout) => {
      return sum + (payout.status === "Completed" ? Number(payout.amount) : 0);
    }, 0);

    return NextResponse.json({
      validatorId: validator.id,
      publicKey: validator.publicKey,
      payouts,
      summary: {
        totalPayouts: payouts.length,
        completedPayouts: payouts.filter((p) => p.status === "Completed")
          .length,
        totalPaidEth: totalPaid,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
