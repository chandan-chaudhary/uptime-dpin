import { prisma } from "@repo/db";
// import { User, currentUser } from "@clerk/nextjs/server";

/**
 * Get or create a user in our database based on Clerk authentication
 * This syncs Clerk users to our local database
 */
export async function getOrCreateUser(clerkId?: string) {
  //   const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }
  let user;
  // Check if user exists in our database
  user = await prisma.user.findUnique({
    where: { clerkId },
  });
  // if(!user)
  // user = await prisma.user.findUnique({
  //   where: { id: clerkId },
  // });

  // If user doesn't exist, create them
  if (!user) {
    // const clerkUser = await currentUser();

    // if (!clerkUser) {
    //   return null;
    // }

    // // Get primary email from Clerk
    // const email =
    //   clerkUser.emailAddresses.find(
    //     (e) => e.id === clerkUser.primaryEmailAddressId
    //   )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    // if (!email) {
    //   throw new Error("No email found for user");
    // }

    // Create user in our database
    user = await prisma.user.create({
      data: {
        clerkId,
        email: clerkId + "@clerk.local", // Using clerkId as placeholder email
      },
    });
    console.log(user);
  }

  return user;
}

/**
 * Get internal user ID from Clerk ID
 * Returns the UUID from our database
 */
export async function getUserIdFromClerk(): Promise<string | null> {
  const user = await getOrCreateUser();
  return user?.id || null;
}
