# 🛡️ UptimeGuard - Decentralized Website Monitoring

A decentralized, blockchain-powered website monitoring platform that ensures transparent and reliable uptime tracking through a network of distributed validators.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Applications](#applications)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Features](#features)

## 🌟 Overview

UptimeGuard is a decentralized website monitoring system that leverages blockchain technology and distributed validators to provide transparent, tamper-proof uptime tracking. The platform consists of three main applications working together:

- **Frontend** - User-facing dashboard for monitoring websites
- **Hub** - Central coordination server managing validators and websites
- **Validator** - Distributed nodes that perform website health checks

## 🏗️ Architecture

The system uses a hub-and-spoke architecture:

```
┌──────────────┐
│   Frontend   │ ← Users monitor websites & manage subscriptions
└──────┬───────┘
       │
┌──────▼───────┐
│     Hub      │ ← Coordinates validators, stores data
└──────┬───────┘
       │
   ┌───┴───┬───────────┬─────────┐
   ▼       ▼           ▼         ▼
[Val 1] [Val 2]  ... [Val N]  ← Perform health checks
```

- **WebSocket Communication**: Real-time bidirectional communication between Hub and Validators
- **Blockchain Integration**: Ethereum smart contracts for payments and validator rewards
- **PostgreSQL Database**: Centralized data storage via Prisma ORM

## 📱 Applications

### Frontend (`/apps/frontend`)

**Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS, Clerk Auth

A modern web application providing:

- **Dashboard**: Real-time website monitoring with uptime statistics
- **Subscription Management**: Tiered pricing plans (Starter, Professional, Enterprise)
- **Invoice System**: Downloadable PDF invoices with payment history
- **Authentication**: Secure user authentication via Clerk
- **Payment Integration**: Ethereum-based payment processing
- **Admin Panel**: Contract management and system administration

**Key Features**:
- Real-time uptime tracking with 3-minute resolution windows
- Color-coded status indicators (Good/Bad/Degraded)
- Average response time calculations
- Subscription badges (Free, Starter, Professional, Enterprise)
- Historical data visualization
- PDF invoice generation

### Hub (`/apps/hub`)

**Tech Stack**: Node.js, WebSocket (ws), Prisma, Ethers.js

Central coordination server that:

- **Validator Management**: Registers and manages validator nodes
- **Task Distribution**: Assigns website monitoring tasks to validators
- **Data Aggregation**: Collects and stores health check results
- **Payment Processing**: Handles validator payouts and user subscriptions
- **WebSocket Server**: Real-time communication with validators

**WebSocket Events**:
- `register` - Validator registration
- `check_website` - Health check assignment
- `report_status` - Status report from validator
- `payout_request` - Validator payment requests

### Validator (`/apps/validator`)

**Tech Stack**: Node.js, TypeScript, Ethers.js, Axios

Distributed nodes that:

- **Website Health Checks**: Performs HTTP requests to monitor websites
- **Latency Measurement**: Tracks response times
- **Status Reporting**: Reports results back to Hub
- **Payout Management**: Requests and tracks earnings
- **CLI Interface**: Interactive command-line interface

**CLI Commands**:
```bash
uptime-validator start     # Start validator node
uptime-validator stop      # Stop validator node
uptime-validator status    # Check validator status
uptime-validator pending   # View pending payouts
uptime-validator history   # View payout history
uptime-validator withdraw  # Request payout
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Ethereum wallet (for payments)
- Clerk account (for authentication)

### Installation

```bash
# Clone repository
git clone https://github.com/chandan-chaudhary/uptime-dpin.git
cd uptime-dpin

# Install dependencies
npm install

# Setup database
cd packages/db
npx prisma generate
npx prisma migrate dev

# Build all packages
npm run build
```

## 🔐 Environment Setup

### Frontend (`apps/frontend/.env.local`)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/uptime_dpin"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Ethereum Configuration
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS="0x..."
PRIVATE_KEY="0x..."
```

### Hub (`apps/hub/.env`)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/uptime_dpin"

# Hub Configuration
HUB_PORT=8080
```

### Validator (`apps/validator/.env`)

```bash
# Validator Configuration
VALIDATOR_ID="your-unique-validator-id"
PRIVATE_KEY="0x..."
HUB_URL="ws://localhost:8080"
APPLICATION_URL="http://localhost:3000"
LOCATION="US-East"
```

## 💻 Development

### Run All Applications

```bash
# Development mode (from root)
npm run dev
```

### Run Individual Applications

```bash
# Frontend (Port 3000)
cd apps/frontend
npm run dev

# Hub (Port 8080)
cd apps/hub
npm run dev

# Validator
cd apps/validator
npm run build
npm link  # Makes CLI globally available
uptime-validator start
```

### Database Management

```bash
# Generate Prisma client
cd packages/db
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# View database in Prisma Studio
npx prisma studio
```

## 🚢 Deployment

### Frontend
- **Platforms**: Vercel, Netlify, or any Next.js hosting platform
- **Requirements**: 
  - Configure all environment variables
  - Set up Clerk authentication domain
  - Ensure database connectivity

### Hub
- **Platforms**: Railway, Render, Heroku, or any Node.js hosting
- **Requirements**:
  - PostgreSQL database connection
  - WebSocket support enabled
  - Stable network connection

### Validator
- **Platforms**: Any server with Node.js
- **Requirements**:
  - Unique validator ID per instance
  - Ethereum private key with funds for transactions
  - Network connectivity to Hub WebSocket server

## ✨ Features

### For Users
- ✅ Real-time website monitoring
- ✅ Multiple subscription tiers (Starter, Professional, Enterprise)
- ✅ Historical uptime data and analytics
- ✅ Detailed latency metrics
- ✅ PDF invoice generation
- ✅ Ethereum payment processing
- ✅ Subscription status badges

### For Validators
- ✅ Automated health checks
- ✅ Earnings tracking
- ✅ Instant payout requests
- ✅ Interactive CLI interface
- ✅ Multiple validator support
- ✅ Transparent reward system

### For Administrators
- ✅ User management
- ✅ Validator oversight
- ✅ Payment processing
- ✅ System analytics
- ✅ Smart contract integration

## 🛠️ Tech Stack

**Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Clerk, Radix UI, jsPDF  
**Backend**: Node.js, WebSocket (ws), Prisma ORM  
**Database**: PostgreSQL  
**Blockchain**: Ethereum, Ethers.js, Solidity  
**Monorepo**: Turborepo  

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Turborepo
