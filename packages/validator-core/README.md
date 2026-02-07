# @uptime-dpin/validator-core

Platform-agnostic validator core that works in **both Node.js (CLI) and browsers (mobile/desktop)**.

## Features

- ✅ **Wallet-based signing** - No private keys in browser storage
- ✅ **Platform-agnostic** - Works in Node.js and browsers
- ✅ **Flexible authentication** - MetaMask, WalletConnect, Ledger, or private key
- ✅ **WebSocket reconnection** - Automatic exponential backoff
- ✅ **TypeScript** - Full type safety

## Installation

```bash
npm install @uptime-dpin/validator-core
```

## Usage

### Browser (React/Next.js with MetaMask)

```typescript
import {
  UptimeValidator,
  createValidatorFromBrowserWallet,
} from "@uptime-dpin/validator-core/browser";

// Connect wallet and create validator
const config = await createValidatorFromBrowserWallet("ws://localhost:8080");
const validator = new UptimeValidator(config);

// Initialize and connect
await validator.initialize();
await validator.connect();

// Listen to events
validator.emitter.on("hub", (message) => {
  console.log("Hub message:", message);
});

// Check payout
const payout = await validator.getPendingPayout("https://api.example.com");
console.log("Pending:", payout.pendingPayout.eth, "ETH");

// Disconnect
validator.disconnect();
```

### Node.js CLI (with private key)

```typescript
import {
  UptimeValidator,
  createValidatorFromPrivateKey,
} from "@uptime-dpin/validator-core";

// Create validator from private key (backward compatible)
const config = createValidatorFromPrivateKey(
  "ws://localhost:8080",
  process.env.VALIDATOR_PRIVATE_KEY!
);

const validator = new UptimeValidator(config);

// Initialize and connect
await validator.initialize();
await validator.connect();

// Same API as browser!
```

### Node.js with Hardware Wallet (Advanced)

```typescript
import {
  UptimeValidator,
  createValidatorFromSigner,
} from "@uptime-dpin/validator-core";
import { ethers } from "ethers";

// Use Ledger or any ethers.Signer
const provider = new ethers.JsonRpcProvider("https://eth-mainnet.example.com");
const ledgerSigner = new LedgerSigner(provider);

const config = createValidatorFromSigner("ws://localhost:8080", ledgerSigner);
const validator = new UptimeValidator(config);
```

## API

### `UptimeValidator`

#### Constructor

```typescript
constructor(config: ValidatorConfig)
```

#### Methods

- `initialize(): Promise<void>` - Get public key from signer
- `connect(): Promise<void>` - Connect to hub WebSocket
- `disconnect(): void` - Disconnect from hub
- `getPendingPayout(apiUrl: string): Promise<PendingPayoutResponse>` - Fetch pending payout
- `getPayoutHistory(apiUrl: string): Promise<PayoutHistoryResponse>` - Fetch payout history
- `requestPayout(apiUrl: string): Promise<PayoutRequestResponse>` - Request payout
- `getValidatorId(): string` - Get validator ID
- `getPublicKey(): string` - Get wallet address

#### Events

```typescript
validator.emitter.on("hub", (message: OutgoingMessage) => {
  // Hub sent a message
});
```

## Architecture

```
packages/validator-core/
├── src/
│   ├── validator.ts       # Core platform-agnostic logic
│   ├── node.ts            # Node.js adapters (ws, axios, crypto)
│   ├── browser.ts         # Browser adapters (WebSocket, fetch, crypto)
│   └── index.ts           # Main export (Node.js)
```

## How it Works

The validator uses **dependency injection** to be platform-agnostic:

- **WebSocket**: `ws` library (Node.js) or native `WebSocket` (browser)
- **HTTP**: `axios` (Node.js) or `fetch` (browser)
- **UUID**: `crypto.randomUUID()` (both)
- **Signer**: `ethers.Wallet` (private key) or `ethers.BrowserProvider` (MetaMask)

## License

Private
