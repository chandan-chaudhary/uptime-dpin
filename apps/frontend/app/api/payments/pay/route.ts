
import { NextRequest, NextResponse } from "next/server";
import { InvoiceStatus, LedgerType, prisma } from "@repo/db";
import { getUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { planId, amountEth, txHash, publicKey, status } = await request.json();
  const userId = getUserId(request);

  try {
    // Create invoice with status from frontend
    const invoice = await prisma.invoice.create({
      data: {
        userId: userId!, // Assumed to be non-null from middleware
        amount: amountEth,
        currency: "ETH",
        status: status === "Paid" ? InvoiceStatus.Paid : InvoiceStatus.Failed,
        paidAt: status === "Paid" ? new Date() : null,
        txHash,
        paidByPublicKey: publicKey,
        metadata: { planId },
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        publicKey,
        userId: userId,
        amount: amountEth,
        currency: "ETH",
        type: status === "Paid" ? LedgerType.Debit : LedgerType.Payout,
        reference: invoice.id,
        metadata: { txHash, planId },
      },
    });

    return NextResponse.json({
      success: true,
      txHash,
      invoiceId: invoice.id,
    });
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "string"
        ? e
        : JSON.stringify(e);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}


// import { NextRequest, NextResponse } from "next/server";
// import { ethers } from "ethers";
// import paymentAbi from "@/lib/Payment_abi.json";
// import { prisma } from "@repo/db";
// import { PAYMENT_CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL } from "@/lib/utils";
// import { getUserId } from "@/lib/auth";

// export async function POST(request: NextRequest) {
//   const { planId, amountEth } = await request.json();
//   const userId = getUserId(request);
//   // Connect to Ethereum provider and wallet
//   const provider = new ethers.JsonRpcProvider(RPC_URL);
//   const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
//   const publicKey = wallet.address;
//   // Contract address (replace with your deployed address)
//   const contractAddress = PAYMENT_CONTRACT_ADDRESS;
//   const contract = new ethers.Contract(contractAddress, paymentAbi.abi, wallet);

//   try {
//     // Call receivePayment on contract
//     const tx = await contract.receivePayment(
//       publicKey,
//       ethers.parseEther(amountEth.toString()),
//       {
//         value: ethers.parseEther(amountEth.toString()),
//       }
//     );
//     const receipt = await tx.wait();
//     console.log(receipt, 'from transaction');
    

//     // Update Invoice and LedgerEntry in DB
//     const invoice = await prisma.invoice.create({
//       data: {
//         userId: userId!,
//         amount: amountEth,
//         currency: "ETH",
//         status: "Paid",
//         paidAt: new Date(),
//         txHash: receipt.hash,
//         paidByPublicKey: publicKey,
//         metadata: { planId },
//       },
//     });

//     await prisma.ledgerEntry.create({
//       data: {
//         publicKey,
//         userId,
//         amount: amountEth,
//         currency: "ETH",
//         type: "Debit",
//         reference: invoice.id,
//         metadata: { txHash: receipt.hash, planId },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       txHash: receipt.hash,
//       invoiceId: invoice.id,
//     });
//   } catch (e) {
//     const message =
//       e instanceof Error
//         ? e.message
//         : typeof e === "string"
//           ? e
//           : JSON.stringify(e);
//     return NextResponse.json(
//       { success: false, error: message },
//       { status: 500 }
//     );
//   }
// }
