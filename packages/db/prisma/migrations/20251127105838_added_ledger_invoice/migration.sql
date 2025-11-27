-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');

-- CreateEnum
CREATE TYPE "TxKind" AS ENUM ('Payment', 'Payout', 'Fee', 'Other');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('Pending', 'Confirmed', 'Failed', 'Reverted');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('Pending', 'Processing', 'Completed', 'Failed', 'Cancelled');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('Credit', 'Debit', 'Fee', 'Refund', 'Payout');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DECIMAL(30,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETH',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'Pending',
    "paidAt" TIMESTAMP(3),
    "txHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidByPublicKey" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnchainTransaction" (
    "id" UUID NOT NULL,
    "txHash" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" DECIMAL(30,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETH',
    "kind" "TxKind" NOT NULL,
    "status" "TxStatus" NOT NULL DEFAULT 'Pending',
    "blockHash" TEXT,
    "blockNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnchainTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" UUID NOT NULL,
    "validatorId" UUID NOT NULL,
    "amount" DECIMAL(30,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETH',
    "status" "PayoutStatus" NOT NULL DEFAULT 'Pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "txHash" TEXT,
    "note" TEXT,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" UUID NOT NULL,
    "publicKey" TEXT NOT NULL,
    "userId" UUID,
    "amount" DECIMAL(30,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETH',
    "type" "LedgerType" NOT NULL,
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OnchainTransaction_txHash_key" ON "OnchainTransaction"("txHash");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
