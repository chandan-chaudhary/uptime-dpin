# Uptime Monitoring - WebSocket Architecture

## 🏗️ System Architecture

```
┌─────────────┐         WebSocket          ┌──────────┐
│  Validator  │◄─────────────────────────►│   Hub    │
│   Nodes     │  (health checks, ticks)    │  Server  │
└─────────────┘                            └──────────┘
      ↓                                          ↓
   Checks                                   Stores to
   Websites                                 Database
```

## 📦 Components

### Hub Server (`apps/hub`)

- **Role**: Central coordinator
- **Port**: 8080 (default)
- **Responsibilities**:
  - Manage validator connections
  - Dispatch website check tasks
  - Collect tick results
  - Store data in PostgreSQL database
  - Monitor validator health (heartbeats)

### Validator Nodes (`apps/validator`)

- **Role**: Website checkers
- **Responsibilities**:
  - Connect to hub via WebSocket
  - Receive website check tasks
  - Perform HTTP health checks
  - Report results (ticks) to hub
  - Send periodic heartbeats

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Root directory
npm install

# Install hub dependencies
cd apps/hub
npm install

# Install validator dependencies
cd ../validator
npm install
```

### 2. Configure Environment Variables

Create `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/uptime_db"

# Hub Configuration
HUB_PORT=8080

# Validator Configuration (for development)
HUB_URL=ws://localhost:8080
VALIDATOR_PUBLIC_KEY=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
VALIDATOR_LOCATION="US-East Virginia"
```

### 3. Start the Hub

```bash
# Terminal 1
cd apps/hub
npm run dev
```

Expected output:

```
🚀 Uptime Hub started on port 8080
📡 WebSocket endpoint: ws://localhost:8080
```

### 4. Start Validator(s)

```bash
# Terminal 2 - First validator
cd apps/validator
npm run dev

# Terminal 3 - Second validator (optional)
VALIDATOR_PUBLIC_KEY=0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed \
VALIDATOR_LOCATION="US-West California" \
npm run dev
```

Expected output:

```
🚀 Starting Uptime Validator
📍 Location: US-East Virginia
🔑 Public Key: 0x742d35...
🔌 Connecting to hub at ws://localhost:8080...
✅ Connected to hub
✅ Registration successful
📥 Received 3 website(s) to check
✅ Checked https://google.com: Good (85ms)
```

## 📡 WebSocket Protocol

### Validator → Hub Messages

#### 1. REGISTER

```json
{
  "type": "REGISTER",
  "payload": {
    "publicKey": "0x742d35Cc...",
    "location": "US-East Virginia"
  }
}
```

#### 2. HEARTBEAT

```json
{
  "type": "HEARTBEAT",
  "payload": {
    "timestamp": "2025-11-20T12:00:00Z"
  }
}
```

#### 3. TICK_RESULT

```json
{
  "type": "TICK_RESULT",
  "payload": {
    "websiteId": "uuid",
    "status": "Good",
    "latency": 85.5,
    "timestamp": "2025-11-20T12:00:00Z",
    "error": null
  }
}
```

### Hub → Validator Messages

#### 1. REGISTERED

```json
{
  "type": "REGISTERED",
  "payload": {
    "validatorId": "uuid",
    "message": "Successfully registered",
    "connectedValidators": 3
  }
}
```

#### 2. CHECK_WEBSITE

```json
{
  "type": "CHECK_WEBSITE",
  "payload": {
    "websites": [
      {
        "websiteId": "uuid",
        "url": "https://google.com",
        "interval": 30
      }
    ],
    "timestamp": "2025-11-20T12:00:00Z"
  }
}
```

#### 3. HEARTBEAT_ACK

```json
{
  "type": "HEARTBEAT_ACK",
  "payload": {
    "timestamp": "2025-11-20T12:00:00Z",
    "activeWebsites": 5
  }
}
```

## 🔄 Data Flow

### Website Check Flow

1. Hub fetches enabled websites from database every 30 seconds
2. Hub broadcasts CHECK_WEBSITE to all connected validators
3. Each validator performs HTTP GET request to website
4. Validator measures latency and status
5. Validator sends TICK_RESULT back to hub
6. Hub stores tick in database (WebsiteTick table)
7. Frontend dashboard displays real-time data

### Validator Connection Flow

1. Validator connects to hub WebSocket
2. Validator sends REGISTER message
3. Hub checks/creates validator in database
4. Hub sends REGISTERED confirmation
5. Validator starts sending heartbeats every 30s
6. Hub monitors heartbeats, disconnects if timeout (60s)

## 🛠️ Database Schema

### Validator Model

```prisma
model Validator {
  id        String   @id @default(uuid())
  publicKey String   @unique
  ipAddress String
  location  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ticks     WebsiteTick[]
}
```

### WebsiteTick Model

```prisma
model WebsiteTick {
  id          String        @id @default(uuid())
  websiteId   String
  validatorId String
  timestamp   DateTime
  status      WebsiteStatus // Good | Bad
  latency     Float
  createdAt   DateTime      @default(now())
}
```

## 📊 Monitoring

### Hub Logs

- Connection events (validator connect/disconnect)
- Registration events
- Tick received events
- Periodic stats (every 60s)

### Validator Logs

- Connection status
- Website check results
- Error messages

## 🔧 Configuration Options

### Hub Environment Variables

| Variable       | Default | Description                  |
| -------------- | ------- | ---------------------------- |
| `HUB_PORT`     | 8080    | WebSocket server port        |
| `DATABASE_URL` | -       | PostgreSQL connection string |

### Validator Environment Variables

| Variable               | Default             | Description             |
| ---------------------- | ------------------- | ----------------------- |
| `HUB_URL`              | ws://localhost:8080 | Hub WebSocket URL       |
| `VALIDATOR_PUBLIC_KEY` | random              | Ethereum wallet address |
| `VALIDATOR_LOCATION`   | Local Development   | Geographic location     |

## 🚨 Error Handling

### Hub

- Invalid messages → Send ERROR response
- Database errors → Log and continue
- Validator timeout (60s) → Close connection
- Unknown validator → Reject TICK_RESULT

### Validator

- Connection lost → Auto-reconnect after 5s
- HTTP request timeout (10s) → Report Bad status
- Network error → Report Bad status with error message

## 🎯 Production Deployment

### Scaling Validators

1. Deploy validators in multiple regions
2. Use different `VALIDATOR_PUBLIC_KEY` for each
3. Set appropriate `VALIDATOR_LOCATION` names
4. All validators connect to same hub

### Scaling Hub

- Single hub instance sufficient for 100+ validators
- Use WebSocket load balancer for higher scale
- Consider Redis pub/sub for multi-hub setup

### Security Considerations

- [ ] Add authentication tokens for validators
- [ ] Encrypt WebSocket connections (WSS)
- [ ] Rate limit validator registrations
- [ ] Validate website URLs before checks
- [ ] Sign messages with validator private key

## 📝 Example: Multiple Validators

```bash
# Terminal 1 - Hub
cd apps/hub
npm run dev

# Terminal 2 - US East
cd apps/validator
VALIDATOR_PUBLIC_KEY=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1 \
VALIDATOR_LOCATION="US-East Virginia" \
npm run dev

# Terminal 3 - US West
VALIDATOR_PUBLIC_KEY=0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed \
VALIDATOR_LOCATION="US-West California" \
npm run dev

# Terminal 4 - EU
VALIDATOR_PUBLIC_KEY=0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359 \
VALIDATOR_LOCATION="EU-West Ireland" \
npm run dev
```

## 🐛 Debugging

### Check Hub Status

```bash
# View hub logs
cd apps/hub
npm run dev

# Look for:
# - "Active validators: X"
# - "Dispatching X website checks"
```

### Check Validator Status

```bash
# View validator logs
cd apps/validator
npm run dev

# Look for:
# - "Connected to hub"
# - "Registration successful"
# - "Checked https://... : Good (Xms)"
```

### Check Database

```bash
# View validators
cd packages/db
npx prisma studio

# Check Validator table for connected validators
# Check WebsiteTick table for recent ticks
```
