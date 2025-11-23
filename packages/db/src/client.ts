import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Increase connection pool and timeout for concurrent validator responses
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configure transaction timeout and pool size
    transactionOptions: {
      timeout: 10000, // 10 seconds transaction timeout
      maxWait: 5000, // 5 seconds max wait to acquire connection
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
