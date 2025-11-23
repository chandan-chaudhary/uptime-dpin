# Clerk Authentication Flow in Next.js

## Overview

This app uses Clerk for authentication. Here's how the authentication flow works:

## 🔐 How Authentication Works

### 1. **Client Side (Frontend/Hooks)**

- **NO manual token handling needed**
- Clerk automatically manages authentication via **httpOnly cookies**
- Your hooks (like `useWebsites`) make regular API calls without adding Authorization headers
- Example:

```typescript
// ✅ Correct - Simple axios call, Clerk handles auth via cookies
const response = await axios.get("/api/websites");

// ❌ Wrong - Don't manually add tokens
const response = await axios.get("/api/websites", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 2. **Middleware Layer**

The middleware (`middleware.ts`) does two things:

1. **Protects routes** - Ensures user is authenticated for protected routes
2. **Injects userId** - Extracts userId from Clerk session and adds it to request headers

```typescript
export default clerkMiddleware(async (auth, request) => {
  // Protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // For API routes, inject userId into headers
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const { userId } = await auth();
    if (userId) {
      requestHeaders.set("x-user-id", userId);
    }
  }
});
```

### 3. **API Routes (Backend)**

API routes have **two options** to get userId:

#### Option A: From Headers (set by middleware)

```typescript
import { getUserId, requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = requireAuth(request); // Throws if not authenticated
  // or
  const userId = getUserId(request); // Returns null if not authenticated

  // Use userId in your logic
  const websites = await prisma.website.findMany({
    where: { userId },
  });
}
```

#### Option B: Directly from Clerk (no middleware needed)

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use userId in your logic
}
```

## 📁 File Structure

```
apps/frontend/
├── middleware.ts              # Clerk middleware - injects userId
├── lib/
│   └── auth.ts               # Helper functions for auth
├── hooks/
│   └── useWebsites.ts        # Hooks use simple axios (no tokens)
└── app/
    └── api/
        └── websites/
            └── route.ts      # API routes get userId from headers or Clerk
```

## 🎯 Key Points

1. **Clerk manages authentication automatically via cookies** - no manual token handling
2. **Middleware injects `x-user-id` header** for easy access in API routes
3. **Hooks don't need to send tokens** - just make regular API calls
4. **API routes get userId from headers** or directly from `auth()` function
5. **Session is maintained across requests** via httpOnly cookies (secure by default)

## 🔒 Security Benefits

- ✅ **httpOnly cookies** - JavaScript can't access them (XSS protection)
- ✅ **Automatic token refresh** - Clerk handles it
- ✅ **Secure by default** - No tokens in localStorage or sessionStorage
- ✅ **CSRF protection** - Built into Clerk
- ✅ **Session management** - Handled by Clerk automatically

## 📝 Example: Creating a New Hook

When creating new hooks for API calls, follow this pattern:

```typescript
// hooks/useMyData.ts
import { useState, useEffect } from "react";
import axios from "axios";

export function useMyData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // ✅ Simple call - Clerk handles auth automatically
      const response = await axios.get("/api/my-endpoint");
      setData(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
}
```

## 🚀 Migration from Manual Token Auth

If you were previously using manual Bearer tokens:

### Before (Manual Tokens) ❌

```typescript
const token = await getToken();
const response = await axios.get("/api/data", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### After (Clerk) ✅

```typescript
const response = await axios.get("/api/data");
// That's it! Clerk handles everything
```

## 📚 Additional Resources

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Middleware](https://clerk.com/docs/references/nextjs/clerk-middleware)
- [Clerk Server-Side Helpers](https://clerk.com/docs/references/nextjs/auth)
