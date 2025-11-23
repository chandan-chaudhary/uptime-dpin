# Option 1: Separate Servers (RECOMMENDED) ✅

**Current Setup:**

- Next.js: `http://localhost:3000`
- WebSocket Hub: `ws://localhost:8080`

```bash
# Terminal 1 - Frontend
cd apps/frontend
npm run dev

# Terminal 2 - Hub
cd apps/hub
npm run dev

# Terminal 3 - Validator
cd apps/validator
npm run dev
```

**Pros:**

- ✅ Simpler architecture
- ✅ Independent scaling
- ✅ Easier debugging
- ✅ No Next.js custom server needed
- ✅ Better for serverless deployment

---

# Option 2: Same Port (Integrated) 🔄

**Setup:**

- Next.js + WebSocket: `http://localhost:3000`
- WebSocket endpoint: `ws://localhost:3000/ws`

## Installation

```bash
cd apps/frontend
npm install ws @types/ws
```

## Usage

### Update package.json

```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "dev:next": "next dev",
    "build": "next build",
    "start": "node server.js"
  }
}
```

### Update Validator Connection

```typescript
// apps/validator/src/index.ts
const HUB_URL = process.env.HUB_URL || "ws://localhost:3000/ws";
```

### Run

```bash
# Terminal 1 - Frontend + Hub (integrated)
cd apps/frontend
npm run dev

# Terminal 2 - Validator
cd apps/validator
HUB_URL=ws://localhost:3000/ws npm run dev
```

**Pros:**

- ✅ Single port (easier firewall)
- ✅ Same domain (no CORS)

**Cons:**

- ❌ Requires custom Next.js server
- ❌ Disables Next.js automatic static optimization
- ❌ Can't use Vercel/Netlify edge functions
- ❌ More complex architecture

---

## Recommendation

**Use Option 1 (Separate Servers)** unless you have specific requirements like:

- Corporate firewall allows only one port
- Must run on same domain for security
- Simplified Docker deployment

For most cases, separate servers is the better architecture.
