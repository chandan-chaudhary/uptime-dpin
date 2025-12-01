# Validator Deployment Guide

This guide explains how to deploy and distribute the Uptime Validator CLI.

## For Package Maintainers

### Publishing to npm

1. **Ensure you're logged in to npm:**

   ```bash
   npm login
   ```

2. **Update version in package.json:**

   ```bash
   npm version patch  # or minor, or major
   ```

3. **Build the package:**

   ```bash
   npm run build
   ```

4. **Publish to npm:**
   ```bash
   npm publish --access public
   ```

### Package Distribution Options

#### Option 1: npm Registry (Recommended)

Users install via:

```bash
npm install -g @uptime-dpin/validator
```

**Pros:**

- Easy updates via `npm update -g @uptime-dpin/validator`
- Cross-platform (works on Windows, Mac, Linux)
- Automatic dependency management

**Cons:**

- Requires Node.js on user machines

#### Option 2: GitHub Releases

Attach the built package to GitHub releases:

```bash
npm pack
# Upload the .tgz file to GitHub releases
```

Users install via:

```bash
npm install -g https://github.com/your-org/uptime-dpin/releases/download/v1.0.0/uptime-dpin-validator-1.0.0.tgz
```

#### Option 3: Docker Image

Create a Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
ENTRYPOINT ["node", "dist/cli.js"]
```

Build and publish:

```bash
docker build -t your-org/uptime-validator:latest .
docker push your-org/uptime-validator:latest
```

Users run via:

```bash
docker run -it --rm \
  -e HUB_URL=ws://your-hub:8080 \
  -e VALIDATOR_PRIVATE_KEY=0x... \
  -e VALIDATOR_PUBLIC_KEY=0x... \
  your-org/uptime-validator:latest
```

## For Validators (End Users)

### System Requirements

- Node.js 18+ (if using npm installation)
- Linux, macOS, or Windows
- Internet connection to reach the hub

### Installation Steps

1. **Install Node.js** (if not already installed):
   - Visit https://nodejs.org/ and download the LTS version
   - Or use a package manager:

     ```bash
     # Ubuntu/Debian
     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
     sudo apt-get install -y nodejs

     # macOS
     brew install node

     # Windows
     # Download from nodejs.org
     ```

2. **Install the validator CLI:**

   ```bash
   npm install -g @uptime-dpin/validator
   ```

3. **Generate Ethereum keys** (if you don't have them):

   ```bash
   # You can use any Ethereum wallet or generate keys programmatically
   # Example using ethers.js:
   node -e "const ethers = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Private:', w.privateKey); console.log('Public:', w.address);"
   ```

4. **Create config file:**

   ```bash
   cat > ~/.validator-config.json << EOF
   {
     "HUB_URL": "ws://your-hub-domain:8080",
     "VALIDATOR_PRIVATE_KEY": "0x...",
     "VALIDATOR_PUBLIC_KEY": "0x...",
     "PAYOUT_API_URL": "https://your-api-domain.com/api/payments/payout"
   }
   EOF
   ```

5. **Run the validator:**
   ```bash
   uptime-validator
   ```

### Running as a Service

#### Linux (systemd)

Create `/etc/systemd/system/uptime-validator.service`:

```ini
[Unit]
Description=Uptime Validator
After=network.target

[Service]
Type=simple
User=validator
WorkingDirectory=/home/validator
ExecStart=/usr/bin/uptime-validator
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable uptime-validator
sudo systemctl start uptime-validator
sudo systemctl status uptime-validator
```

#### macOS (launchd)

Create `~/Library/LaunchAgents/com.uptime-dpin.validator.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.uptime-dpin.validator</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/uptime-validator</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load and start:

```bash
launchctl load ~/Library/LaunchAgents/com.uptime-dpin.validator.plist
launchctl start com.uptime-dpin.validator
```

#### Windows (NSSM)

1. Download NSSM from https://nssm.cc/download
2. Install the service:
   ```cmd
   nssm install UptimeValidator "C:\Program Files\nodejs\uptime-validator.cmd"
   nssm start UptimeValidator
   ```

### Monitoring and Logs

Check validator status:

```bash
# If running interactively
uptime-validator
> status

# If running as service (Linux)
sudo journalctl -u uptime-validator -f

# If running as service (macOS)
tail -f ~/Library/Logs/uptime-validator.log
```

### Updating

```bash
npm update -g @uptime-dpin/validator
# Restart the service if running as daemon
sudo systemctl restart uptime-validator
```

## Security Best Practices

1. **Keep private keys secure:**
   - Never share your private key
   - Use file permissions to protect config: `chmod 600 ~/.validator-config.json`
   - Consider using hardware wallets or key management services

2. **Use dedicated validator accounts:**
   - Don't use your main wallet for validation
   - Create a new Ethereum address specifically for validation

3. **Monitor your validator:**
   - Set up alerts for downtime
   - Check payout balance regularly
   - Monitor system resources (CPU, memory, network)

4. **Keep software updated:**
   - Update Node.js regularly
   - Update the validator CLI when new versions are released
   - Keep your operating system patched

## Troubleshooting

### Validator won't connect

- Check hub URL is correct
- Verify hub is running and accessible
- Check firewall rules
- Try `--verbose` flag for detailed logs

### Can't find uptime-validator command

- Ensure npm global bin is in PATH: `echo $PATH | grep npm`
- Find npm global bin: `npm bin -g`
- Add to PATH if needed: `export PATH=$PATH:$(npm bin -g)`

### Permission denied errors

- On Linux/Mac, you may need sudo for global install: `sudo npm install -g @uptime-dpin/validator`
- Or use nvm to install Node.js without sudo

## Support

For issues and questions:

- GitHub Issues: https://github.com/your-org/uptime-dpin/issues
- Discord: [Your Discord Link]
- Documentation: [Your Docs Link]
