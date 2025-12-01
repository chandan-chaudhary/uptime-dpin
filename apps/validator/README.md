# Uptime Validator CLI

This package provides a CLI tool for running an uptime validator that connects to an Uptime Hub server.

## Installation

### From npm (if published)

```bash
npm install -g @uptime-dpin/validator
```

### Local Install (for development)

1. Clone the repository and build the package:
   ```bash
   cd apps/validator
   npm install
   npm run build
   ```
2. Install globally:
   ```bash
   npm install -g .
   ```

## Usage

Run the CLI from anywhere:

```bash
uptime-validator
```

The validator will automatically connect to the hub if you have configured your credentials.

## Configuration

You can configure your validator using a config file or environment variables.

### Config File (Recommended)

Create a file at `~/.validator-config.json`:

```json
{
  "HUB_URL": "ws://your-hub-domain:8080",
  "VALIDATOR_PRIVATE_KEY": "0x...",
  "VALIDATOR_PUBLIC_KEY": "0x...",
  "PAYOUT_API_URL": "https://your-api-domain.com/api/payments/payout"
}
```

### Environment Variables

Alternatively, set these in your environment or a `.env` file:

```
HUB_URL=ws://your-hub-domain:8080
VALIDATOR_PRIVATE_KEY=0x...
VALIDATOR_PUBLIC_KEY=0x...
PAYOUT_API_URL=https://your-api-domain.com/api/payments/payout
```

## Commands

Once the CLI is running, type `help` to see available commands:

- `register` — Connect and register with the hub
- `start` — Start connection (auto-connects by default)
- `status` — Show connection status
- `pending` — Show pending payout summary
- `payouts` — List pending payouts
- `withdraw <payoutId>` — Request payout withdrawal
- `api-payout` — Call payout API directly for this validator
- `exit` / `quit` — Quit the CLI

## Flags

- `--no-auto-connect` — Disable automatic connection on startup
- `--verbose` — Show hub messages in real-time

## Example

```bash
# Run with auto-connect (default)
uptime-validator

# Run without auto-connect
uptime-validator --no-auto-connect

# Run with verbose logging
uptime-validator --verbose
```

## How It Works

1. The validator reads your configuration from `~/.validator-config.json` or environment variables
2. It connects to the hub via WebSocket using your public/private key pair
3. The hub sends validation tasks (website uptime checks)
4. The validator performs checks and reports results back to the hub
5. You earn rewards for each validation, viewable via the `pending` and `payouts` commands
6. Request payouts via the `api-payout` command or through the withdrawal flow

## Troubleshooting

### "Cannot find module" errors

Make sure you've run `npm run build` before installing globally.

### Connection issues

- Check that your `HUB_URL` is correct and the hub server is running
- Verify your private/public keys are valid Ethereum addresses
- Use `--verbose` flag to see detailed connection logs

### Permission errors on Linux/Mac

You may need to use `sudo` when installing globally:

```bash
sudo npm install -g .
```

## Development

```bash
# Watch mode for development
npm run dev

# Type checking
npm run check-types

# Build for production
npm run build
```

## License

MIT
