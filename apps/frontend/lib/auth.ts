import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@repo/db";

// Get userId from header (set by middleware)
export function getUserId(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

// Get Clerk ID from header
export function getClerkId(request: NextRequest): string | null {
  return request.headers.get("x-clerk-id");
}

// Get or sync user on-demand (lazy loading)
export async function getUserIdLazy(
  request: NextRequest
): Promise<string | null> {
  // First, check if userId is already in headers (from auth routes)
  const userId = getUserId(request);
  if (userId) return userId;

  // If not, get clerkId and look up user
  const clerkId = getClerkId(request);
  if (!clerkId) return null;

  // Look up user by clerkId (assumes already synced)
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  return user?.id || null;
}

// Get userId directly from Clerk auth (alternative method for API routes)
export async function getUserIdFromClerk(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export function requireAuth(request: NextRequest): string {
  const userId = getUserId(request);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

// Alternative: require auth directly from Clerk
export async function requireAuthFromClerk(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}
