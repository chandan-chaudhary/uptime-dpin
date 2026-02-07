"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Server,
  Cpu,
  HardDrive,
  Network,
  Download,
  BookOpen,
  FileCode,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// CodeBlock component defined outside render
const CodeBlock = ({
  code,
  id,
  onCopy,
  isCopied,
}: {
  code: string;
  id: string;
  onCopy: (text: string, id: string) => void;
  isCopied: boolean;
}) => (
  <div className="relative group">
    <div className="absolute top-2 right-2 z-10">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onCopy(code, id)}
        className="bg-slate-800/80 hover:bg-slate-700 text-slate-300"
      >
        {isCopied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </>
        )}
      </Button>
    </div>
    <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-x-auto text-sm">
      <code className="text-emerald-400">{code}</code>
    </pre>
  </div>
);

export default function ValidatorDocumentation() {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {}
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Server className="h-8 w-8 text-emerald-500" />
            <div>
              <h1 className="text-3xl font-bold text-slate-100">
                Validator Setup Guide
              </h1>
              <p className="text-slate-400 mt-1">
                Complete documentation for running an uptime validator node
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Start Alert */}
        <Alert className="mb-8 border-emerald-500/50 bg-emerald-950/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <AlertTitle className="text-emerald-400">
            Quick Start in 3 Steps
          </AlertTitle>
          <AlertDescription className="text-slate-300">
            Install Node.js → Install validator CLI → Configure and run
          </AlertDescription>
        </Alert>

        {/* System Requirements */}
        <Card className="mb-8 border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Cpu className="h-5 w-5 text-emerald-500" />
              System Requirements
            </CardTitle>
            <CardDescription>
              Minimum requirements to run a validator node
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <Cpu className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">CPU</p>
                  <p className="text-sm text-slate-400">2+ cores recommended</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <HardDrive className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">RAM</p>
                  <p className="text-sm text-slate-400">2GB minimum</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <Network className="h-5 w-5 text-cyan-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Network</p>
                  <p className="text-sm text-slate-400">
                    Stable internet connection
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <Terminal className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Software</p>
                  <p className="text-sm text-slate-400">Node.js 18+</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation Steps */}
        <Card className="mb-8 border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Download className="h-5 w-5 text-emerald-500" />
              Installation
            </CardTitle>
            <CardDescription>
              Follow these steps to install the validator CLI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Install Node.js */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Install Node.js
                </h3>
              </div>
              <p className="text-slate-400 mb-4 ml-11">
                Download and install Node.js 18 or higher from{" "}
                <a
                  href="https://nodejs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  nodejs.org
                </a>
              </p>
              <div className="ml-11 space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2 border-slate-700">
                    Ubuntu/Debian
                  </Badge>
                  <CodeBlock
                    id="nodejs-ubuntu"
                    code={`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs`}
                    onCopy={copyToClipboard}
                    isCopied={!!copiedStates["nodejs-ubuntu"]}
                  />
                </div>
                <div>
                  <Badge variant="outline" className="mb-2 border-slate-700">
                    macOS
                  </Badge>
                  <CodeBlock
                    id="nodejs-macos"
                    code="brew install node"
                    onCopy={copyToClipboard}
                    isCopied={!!copiedStates["nodejs-macos"]}
                  />
                </div>
                <div>
                  <Badge variant="outline" className="mb-2 border-slate-700">
                    Verify Installation
                  </Badge>
                  <CodeBlock
                    id="nodejs-verify"
                    code="node --version"
                    onCopy={copyToClipboard}
                    isCopied={!!copiedStates["nodejs-verify"]}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Install Validator CLI */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Install Validator CLI
                </h3>
              </div>
              <p className="text-slate-400 mb-4 ml-11">
                Install the validator package globally using npm
              </p>
              <div className="ml-11">
                <CodeBlock
                  id="install-cli"
                  code="npm install -g @uptime-dpin/validator"
                  onCopy={copyToClipboard}
                  isCopied={!!copiedStates["install-cli"]}
                />
              </div>
            </div>

            {/* Step 3: Generate Keys */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Generate Ethereum Keys
                </h3>
              </div>
              <p className="text-slate-400 mb-4 ml-11">
                Create an Ethereum wallet for your validator identity
              </p>
              <div className="ml-11">
                <Alert className="mb-4 border-yellow-500/50 bg-yellow-950/20">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <AlertTitle className="text-yellow-400">
                    Security Warning
                  </AlertTitle>
                  <AlertDescription className="text-slate-300">
                    Never share your private key. Store it securely and back it
                    up.
                  </AlertDescription>
                </Alert>
                <CodeBlock
                  id="generate-keys"
                  code={`node -e "const ethers = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Private Key:', w.privateKey); console.log('Public Key:', w.address);"`}
                  onCopy={copyToClipboard}
                  isCopied={!!copiedStates["generate-keys"]}
                />
              </div>
            </div>

            {/* Step 4: Configuration */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Configure Validator
                </h3>
              </div>
              <p className="text-slate-400 mb-4 ml-11">
                Create a configuration file at{" "}
                <code className="text-emerald-400 bg-slate-800 px-2 py-1 rounded">
                  ~/.validator-config.json
                </code>
              </p>
              <div className="ml-11">
                <CodeBlock
                  id="config-file"
                  code={`{
  "HUB_URL": "ws://your-hub-domain:8080",
  "VALIDATOR_PRIVATE_KEY": "0x...",
  "VALIDATOR_PUBLIC_KEY": "0x...",
  "APPLICATION_URL": "https://your-application-domain.com"
}`}
                  onCopy={copyToClipboard}
                  isCopied={!!copiedStates["config-file"]}
                />
              </div>
              <Alert className="ml-11 mt-4 border-blue-500/50 bg-blue-950/20">
                <AlertDescription className="text-slate-300 text-sm">
                  <strong className="text-blue-400">Note:</strong>{" "}
                  APPLICATION_URL is required for payout-related commands
                  (pending, history, withdraw). It should point to your frontend
                  application (e.g., https://uptime-monitor.com)
                </AlertDescription>
              </Alert>
            </div>

            {/* Step 5: Run */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                  5
                </div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Start Validator
                </h3>
              </div>
              <p className="text-slate-400 mb-4 ml-11">
                Run the validator CLI and connect to the hub
              </p>
              <div className="ml-11">
                <CodeBlock
                  id="run-validator"
                  code="uptime-validator"
                  onCopy={copyToClipboard}
                  isCopied={!!copiedStates["run-validator"]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CLI Commands */}
        <Card className="mb-8 border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Terminal className="h-5 w-5 text-emerald-500" />
              CLI Commands
            </CardTitle>
            <CardDescription>
              Available commands in the validator CLI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { cmd: "help", desc: "Show all available commands" },
                { cmd: "status", desc: "Display connection status and info" },
                { cmd: "start", desc: "Connect/reconnect to the hub" },
                { cmd: "register", desc: "Register validator with hub" },
                {
                  cmd: "pending",
                  desc: "View pending payout (requires APPLICATION_URL)",
                },
                {
                  cmd: "history",
                  desc: "View payout history (requires APPLICATION_URL)",
                },
                {
                  cmd: "withdraw",
                  desc: "Request payout withdrawal (requires APPLICATION_URL)",
                },
                { cmd: "exit / quit", desc: "Stop validator and exit" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                >
                  <code className="text-emerald-400 font-mono text-sm bg-slate-900 px-3 py-1 rounded min-w-[180px]">
                    {item.cmd}
                  </code>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mb-8 border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Common Issues & Solutions
            </CardTitle>
            <CardDescription>
              Troubleshooting guide for common errors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error 1: Missing Configuration */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-red-400 mb-2">
                ❌ Missing required configuration
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                Error occurs when{" "}
                <code className="text-emerald-400">HUB_URL</code>,{" "}
                <code className="text-emerald-400">VALIDATOR_PRIVATE_KEY</code>,
                or{" "}
                <code className="text-emerald-400">VALIDATOR_PUBLIC_KEY</code>{" "}
                is not set.
              </p>
              <div className="bg-slate-900 rounded p-3 text-sm">
                <p className="text-emerald-400 mb-2">✓ Solution:</p>
                <p className="text-slate-300">
                  Create{" "}
                  <code className="text-emerald-400">
                    ~/.validator-config.json
                  </code>{" "}
                  with all required fields (see Configuration step above)
                </p>
              </div>
            </div>

            {/* Error 2: Invalid Key Format */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-red-400 mb-2">
                ❌ Invalid VALIDATOR_PUBLIC_KEY format
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                Public key must be a valid Ethereum address (0x... 42
                characters)
              </p>
              <div className="bg-slate-900 rounded p-3 text-sm">
                <p className="text-emerald-400 mb-2">✓ Solution:</p>
                <p className="text-slate-300 mb-2">
                  Ensure your public key starts with{" "}
                  <code className="text-emerald-400">0x</code> and is exactly 42
                  characters long
                </p>
                <CodeBlock
                  id="key-example"
                  code="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                  onCopy={copyToClipboard}
                  isCopied={!!copiedStates["key-example"]}
                />
              </div>
            </div>

            {/* Error 3: Connection Failed */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-red-400 mb-2">
                ❌ Failed to connect to hub
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                Cannot establish WebSocket connection to the hub
              </p>
              <div className="bg-slate-900 rounded p-3 text-sm space-y-2">
                <p className="text-emerald-400">✓ Solutions:</p>
                <ul className="text-slate-300 space-y-1 list-disc list-inside">
                  <li>Verify HUB_URL is correct and hub is running</li>
                  <li>Check your internet connection</li>
                  <li>Ensure firewall allows WebSocket connections</li>
                  <li>
                    Try using <code className="text-emerald-400">wss://</code>{" "}
                    for secure connections
                  </li>
                </ul>
              </div>
            </div>

            {/* Error 4: APPLICATION_URL not configured */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-yellow-400 mb-2">
                ⚠️ APPLICATION_URL not configured
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                Required for payout-related commands:{" "}
                <code className="text-emerald-400">pending</code>,{" "}
                <code className="text-emerald-400">history</code>,{" "}
                <code className="text-emerald-400">withdraw</code>
              </p>
              <div className="bg-slate-900 rounded p-3 text-sm">
                <p className="text-emerald-400 mb-2">✓ Solution:</p>
                <p className="text-slate-300 mb-2">
                  Add APPLICATION_URL to your config file:
                </p>
                <CodeBlock
                  id="payout-url"
                  code={`"APPLICATION_URL": "https://your-application-domain.com"`}
                  onCopy={copyToClipboard}
                  isCopied={!!copiedStates["payout-url"]}
                />
              </div>
            </div>

            {/* Error 5: Command not found */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-red-400 mb-2">
                ❌ uptime-validator: command not found
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                CLI not installed or npm global bin not in PATH
              </p>
              <div className="bg-slate-900 rounded p-3 text-sm space-y-2">
                <p className="text-emerald-400">✓ Solutions:</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-300 mb-2">1. Reinstall the CLI:</p>
                    <CodeBlock
                      id="reinstall"
                      code="npm install -g @uptime-dpin/validator"
                      onCopy={copyToClipboard}
                      isCopied={!!copiedStates["reinstall"]}
                    />
                  </div>
                  <div>
                    <p className="text-slate-300 mb-2">
                      2. Check npm global bin path:
                    </p>
                    <CodeBlock
                      id="npm-bin"
                      code="npm bin -g"
                      onCopy={copyToClipboard}
                      isCopied={!!copiedStates["npm-bin"]}
                    />
                  </div>
                  <div>
                    <p className="text-slate-300 mb-2">
                      3. Add to PATH (Linux/Mac):
                    </p>
                    <CodeBlock
                      id="add-path"
                      code="export PATH=$PATH:$(npm bin -g)"
                      onCopy={copyToClipboard}
                      isCopied={!!copiedStates["add-path"]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Running as Service */}
        <Card className="mb-8 border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Server className="h-5 w-5 text-emerald-500" />
              Running as a Service (Optional)
            </CardTitle>
            <CardDescription>
              Keep validator running 24/7 in the background
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3 border-slate-700">
                Linux (systemd)
              </Badge>
              <p className="text-slate-400 text-sm mb-3">
                Create{" "}
                <code className="text-emerald-400">
                  /etc/systemd/system/uptime-validator.service
                </code>
              </p>
              <CodeBlock
                id="systemd-service"
                code={`[Unit]
Description=Uptime Validator
After=network.target

[Service]
Type=simple
User=validator
ExecStart=/usr/bin/uptime-validator
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`}
                onCopy={copyToClipboard}
                isCopied={!!copiedStates["systemd-service"]}
              />
              <div className="mt-3 space-y-2">
                <p className="text-slate-400 text-sm">
                  Enable and start the service:
                </p>
                <CodeBlock
                  id="systemd-commands"
                  code={`sudo systemctl daemon-reload
sudo systemctl enable uptime-validator
sudo systemctl start uptime-validator
sudo systemctl status uptime-validator`}
                  onCopy={copyToClipboard}
                  isCopied={!!copiedStates["systemd-commands"]}
                />
              </div>
            </div>

            <div>
              <Badge variant="outline" className="mb-3 border-slate-700">
                macOS (launchd)
              </Badge>
              <p className="text-slate-400 text-sm mb-3">
                Create{" "}
                <code className="text-emerald-400">
                  ~/Library/LaunchAgents/com.uptime-dpin.validator.plist
                </code>
              </p>
              <CodeBlock
                id="launchd-plist"
                code={`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">
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
</plist>`}
                onCopy={copyToClipboard}
                isCopied={!!copiedStates["launchd-plist"]}
              />
              <div className="mt-3 space-y-2">
                <p className="text-slate-400 text-sm">Load and start:</p>
                <CodeBlock
                  id="launchd-commands"
                  code={`launchctl load ~/Library/LaunchAgents/com.uptime-dpin.validator.plist
launchctl start com.uptime-dpin.validator`}
                  onCopy={copyToClipboard}
                  isCopied={!!copiedStates["launchd-commands"]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-emerald-500/50 bg-linear-to-br from-emerald-950/80 to-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Get support and additional resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="https://github.com/your-org/uptime-dpin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-colors group"
              >
                <FileCode className="h-5 w-5 text-slate-400 group-hover:text-emerald-500" />
                <div>
                  <p className="font-semibold text-slate-200">
                    GitHub Repository
                  </p>
                  <p className="text-sm text-slate-400">
                    View source code and report issues
                  </p>
                </div>
              </a>
              <a
                href="/dashboard"
                className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-colors group"
              >
                <Terminal className="h-5 w-5 text-slate-400 group-hover:text-emerald-500" />
                <div>
                  <p className="font-semibold text-slate-200">Dashboard</p>
                  <p className="text-sm text-slate-400">
                    Monitor your validator performance
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
