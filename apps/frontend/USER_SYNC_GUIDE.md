# Clerk User Sync Implementation

## Overview

This implementation automatically syncs Clerk users to your local database when they sign up or sign in, maintaining your own UUID-based User model while using Clerk for authentication.

## What Was Changed

### 1. Database Schema (`packages/db/prisma/schema.prisma`)

Added `clerkId` field to User model to map Clerk users to your internal UUIDs:

```prisma
model User {
  id        String    @id @default(uuid()) @db.Uuid
  clerkId   String    @unique // Clerk user ID for mapping
  email     String    @unique
  password  String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  websites  Website[]
}
```

### 2. User Sync Helper (`apps/frontend/lib/userSync.ts`)

Created helper functions to automatically sync Clerk users to your database:

- `getOrCreateUser()` - Checks if user exists by clerkId, creates if not
- `getUserIdFromClerk()` - Returns your internal UUID for the authenticated user

### 3. Middleware (`apps/frontend/proxy.ts`)

Updated to sync users on every API request and inject internal UUID:

```typescript
// Now injects your internal UUID (not Clerk's ID)
requestHeaders.set("x-user-id", user.id); // Your UUID
requestHeaders.set("x-clerk-id", clerkId); // Clerk's ID (optional)
```

### 4. API Routes (`apps/frontend/app/api/websites/route.ts`)

Updated to use the synced userId (your internal UUID):

```typescript
const userId = getUserId(request); // Returns your UUID from header
const website = await prisma.website.create({
  data: {
    url,
    userId, // Your UUID - works perfectly with foreign key
  },
});
```

## How It Works

1. **User Signs Up/In with Clerk** → Clerk handles authentication
2. **Middleware Runs** → Calls `getOrCreateUser()`
   - Checks if user exists in your database by `clerkId`
   - If not, creates new user with UUID and Clerk email
   - Returns your internal User record
3. **UUID Injected** → Middleware adds `x-user-id` header with your UUID
4. **API Routes Use UUID** → All routes work with your internal UUID
5. **Database Relationships Work** → Foreign keys use your UUIDs

## Benefits

✅ **Keep your own User model** - UUID-based, your own structure
✅ **Automatic sync** - Users created on first login
✅ **Clerk for auth** - Don't store passwords, use Clerk's security
✅ **Foreign keys work** - All relationships use your UUIDs
✅ **No manual mapping** - Transparent to API routes

## Testing

1. Restart your dev server: `npm run dev`
2. Sign up with a new account via Clerk
3. Check your database - user automatically created
4. Add a website - uses your internal UUID
5. All relationships work perfectly!

## Database Migration

Already applied:

```bash
npx prisma migrate dev --name add_clerk_id_to_user
```

This added the `clerkId` field and unique constraint.
