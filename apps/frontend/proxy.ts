import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/userSync";
import { getUserIdLazy } from "./lib/auth";

// Define public routes (routes that don't require authentication)
const isPublicRoute = createRouteMatcher([
  "/",
  "/signin(.*)",
  "/signup(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // For API routes, inject userId into headers
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const userId = await getUserIdLazy(request);
    if (userId) return NextResponse.next();

    //   {
    //   const requestHeaders = new Headers(request.headers);
    //   requestHeaders.set("x-user-id", userId);

    //   return NextResponse.next({
    //     request: {
    //       headers: requestHeaders,
    //     },
    //   });
    // }
    // If userId not found, try to sync user
    const { userId: clerkId } = await auth();
    // const clerkUser = await currentUser();

    if (clerkId) {
      const requestHeaders = new Headers(request.headers);

      // Sync user to database ONLY on first access or auth-related routes
        const mock_clerkId = '62bafe89-5975-427c-a636-7da3e07dd8bb'
      // const mock_clerkId = '550e8400-e29b-41d4-a716-446655440001'
      // Sync user to database
      const user = await getOrCreateUser(mock_clerkId);
      if (user) {
        requestHeaders.set("x-user-id", user.id);
        // requestHeaders.set("x-clerk-id", clerkId);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   // Get token from Authorization header
//   const authHeader = request.headers.get("authorization");

//   let userId: string | null = null;

//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     const token = authHeader.substring(7);
//     // TODO: In production, verify JWT token here
//     // For now, token = userId (replace with JWT verification)
//     userId = token || "1";
//   }

//   // Clone the request headers
//   const requestHeaders = new Headers(request.headers);

//   // Add userId to headers so it's available in API routes
//   if (userId) {
//     requestHeaders.set("x-user-id", userId);
//   }

//   // Return response with modified headers
//   return NextResponse.next({
//     request: {
//       headers: requestHeaders,
//     },
//   });
// }

// // Configure which routes this middleware runs on
// export const config = {
//   matcher: [
//     "/api/websites/:path*",
//     "/api/validators/:path*",
//     "/api/ticks/:path*",
//     // Don't run on auth routes (login/register don't need userId)
//     // '/api/auth/:path*',
//   ],
// };
