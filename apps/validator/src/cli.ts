#!/usr/bin/env node

import "dotenv/config";
import readline from "readline";
import { UptimeValidator } from "./validator";
import fs from "fs";
import path from "path";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function error(msg: string) {
  console.error(`${colors.red}❌ ERROR: ${msg}${colors.reset}`);
}

function success(msg: string) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function info(msg: string) {
  console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`);
}

function warning(msg: string) {
  console.warn(`${colors.yellow}⚠️  WARNING: ${msg}${colors.reset}`);
}

// Try to read config from ~/.validator-config.json
let config: any = {};
const homeDir = process.env.HOME || process.env.USERPROFILE;
const configPath = homeDir
  ? path.join(homeDir, ".validator-config.json")
  : null;

if (configPath && fs.existsSync(configPath)) {
  try {
    const configContent = fs.readFileSync(configPath, "utf8");
    config = JSON.parse(configContent);
    success(`Configuration loaded from ${configPath}`);
  } catch (e) {
    error(`Failed to parse ~/.validator-config.json: ${(e as Error).message}`);
    error("Please ensure the file contains valid JSON.");
    process.exit(1);
  }
}

// Validate required configuration
const HUB_URL = config.HUB_URL || process.env.HUB_URL;
const PRIVATE_KEY =
  config.VALIDATOR_PRIVATE_KEY || process.env.VALIDATOR_PRIVATE_KEY;
const PUBLIC_KEY =
  config.VALIDATOR_PUBLIC_KEY || process.env.VALIDATOR_PUBLIC_KEY;
const APPLICATION_URL = config.APPLICATION_URL || process.env.APPLICATION_URL;

// Check for missing configuration
const missingConfig: string[] = [];
if (!HUB_URL) missingConfig.push("HUB_URL");
if (!PRIVATE_KEY) missingConfig.push("VALIDATOR_PRIVATE_KEY");
if (!PUBLIC_KEY) missingConfig.push("VALIDATOR_PUBLIC_KEY");

if (missingConfig.length > 0) {
  error("Missing required configuration!");
  console.log("");
  console.log("The following configuration values are required:");
  missingConfig.forEach((key) => {
    console.log(`  ${colors.red}✗${colors.reset} ${key}`);
  });
  console.log("");
  console.log(
    `${colors.cyan}📖 For setup instructions and configuration details, please visit:${colors.reset}`
  );
  console.log(
    `${colors.yellow}${APPLICATION_URL}/validator${colors.reset}`
  );
  console.log("");
  process.exit(1);
}

// Validate Ethereum address format
if (!PUBLIC_KEY.startsWith("0x") || PUBLIC_KEY.length !== 42) {
  error("Invalid VALIDATOR_PUBLIC_KEY format!");
  console.log("");
  console.log(
    `${colors.cyan}📖 For help with validator setup, please visit:${colors.reset}`
  );
  console.log(
    `${colors.yellow}${APPLICATION_URL}/validator${colors.reset}`
  );
  console.log("");
  process.exit(1);
}

if (PRIVATE_KEY.length !== 64) {
  error("Invalid VALIDATOR_PRIVATE_KEY format!");
  console.log("");
  console.log(
    `${colors.cyan}📖 For help with validator setup, please visit:${colors.reset}`
  );
  console.log(
    `${colors.yellow}${APPLICATION_URL}/validator${colors.reset}`
  );
  console.log("");
  process.exit(1);
}

// Validate HUB_URL format
if (!HUB_URL.startsWith("ws://") && !HUB_URL.startsWith("wss://")) {
  error("Invalid HUB_URL format!");
  console.log("");
  console.log(
    `${colors.cyan}📖 For help with validator setup, please visit:${colors.reset}`
  );
  console.log(
    `${colors.yellow}${APPLICATION_URL}/validator${colors.reset}`
  );
  console.log("");
  process.exit(1);
}

success("Configuration validated successfully");
info(`Hub URL: ${HUB_URL}`);
info(`Validator Public Key: ${PUBLIC_KEY}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

async function startCli() {
  console.log(`\n${colors.green}🚀 Validator CLI started${colors.reset}\n`);

  const autoConnect = !process.argv.includes("--no-auto-connect");

  // Create validator in quiet mode (no console.log interruptions during typing)
  const validator = new UptimeValidator(HUB_URL, PUBLIC_KEY, PRIVATE_KEY);

  if (autoConnect) {
    try {
      info("Connecting to hub...");
      validator.connect();
      success("Connection initiated");
    } catch (e) {
      error(`Failed to connect to hub: ${(e as Error).message}`);
      warning("You can try reconnecting with the 'start' command");
    }
  } else {
    info("Auto-connect disabled (use 'start' to connect manually)");
  }

  // Helper to get current connection status
  function getStatus() {
    // @ts-ignore
    const ws = validator["ws"] as any;
    const state = ws
      ? ws.readyState === 0
        ? "CONNECTING"
        : ws.readyState === 1
          ? "OPEN"
          : ws.readyState === 2
            ? "CLOSING"
            : ws.readyState === 3
              ? "CLOSED"
              : String(ws.readyState)
      : "DISCONNECTED";

    return `Hub: ${HUB_URL} | State: ${state} | Validator: ${PUBLIC_KEY || "(unset)"}`;
  }

  // Safe print for hub messages: preserve typed input and cursor
  // Only print if verbose mode is enabled (use --verbose flag)
  const verbose = process.argv.includes("--verbose");

  if (verbose) {
    validator.emitter.on("hub", (msg: any) => {
      try {
        const current = (rl as any).line || "";
        const cursor =
          typeof (rl as any).cursor === "number"
            ? (rl as any).cursor
            : current.length;

        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        console.log("< hub:", JSON.stringify(msg, null, 2));

        rl.prompt(true);
        if (current) {
          rl.write(current);
          const moveBack = current.length - cursor;
          if (moveBack > 0) {
            readline.moveCursor(process.stdout, -moveBack, 0);
            (rl as any).cursor = cursor;
          }
        }
      } catch (e) {
        console.log("< hub:", JSON.stringify(msg, null, 2));
      }
    });
  }

  async function ensureConnected() {
    try {
      // @ts-ignore
      const ws = validator["ws"];
      if (!ws || ws.readyState === 3) {
        info("Reconnecting to hub...");
        validator.connect();
        await new Promise((res) => setTimeout(res, 400));
      }
    } catch (e) {
      error(`Connection failed: ${(e as Error).message}`);
    }
  }

  rl.on("line", async (line) => {
    const parts = line.trim().split(/\s+/);
    const cmd = parts[0];

    switch (cmd) {
      case "help":
        console.log(`\n${colors.cyan}Available Commands:${colors.reset}`);
        console.log(
          `  ${colors.green}help${colors.reset}              - Show this help message`
        );
        console.log(
          `  ${colors.green}status${colors.reset}            - Show connection status`
        );
        console.log(
          `  ${colors.green}register${colors.reset}          - Register with the hub`
        );
        console.log(
          `  ${colors.green}start${colors.reset}             - Start/reconnect to hub`
        );
        console.log(
          `  ${colors.green}pending${colors.reset}           - Show pending payout (requires APPLICATION_URL)`
        );
        console.log(
          `  ${colors.green}history${colors.reset}           - Show payout history (requires APPLICATION_URL)`
        );
        console.log(
          `  ${colors.green}withdraw${colors.reset}          - Request payout withdrawal (requires APPLICATION_URL)`
        );
        console.log(
          `  ${colors.green}exit/quit${colors.reset}         - Exit the CLI\n`
        );
        break;

      case "status":
        const statusInfo = getStatus();
        info(statusInfo);
        break;

      case "register":
        try {
          await ensureConnected();
          success("Registration request sent (will complete on connection)");
        } catch (e) {
          error(`Registration failed: ${(e as Error).message}`);
        }
        break;

      case "start":
        try {
          await ensureConnected();
          success("Connection started");
        } catch (e) {
          error(`Failed to start: ${(e as Error).message}`);
        }
        break;

      case "pending":
        try {
          if (!APPLICATION_URL) {
            error("APPLICATION_URL not configured");
            console.log(
              `${colors.cyan}Please add APPLICATION_URL to your config file or environment variables${colors.reset}`
            );
            console.log(
              `${colors.yellow}Example: https://your-api-domain.com${colors.reset}`
            );
            break;
          }
          info("Fetching pending payout...");
          const pendingData = await validator.getPendingPayout(APPLICATION_URL);
          console.log("");
          success("Pending Payout Information:");
          console.log(
            `  Validator ID: ${colors.cyan}${pendingData.validatorId}${colors.reset}`
          );
          console.log(
            `  Public Key: ${colors.cyan}${pendingData.publicKey}${colors.reset}`
          );
          console.log(
            `  Pending Amount: ${colors.green}${pendingData.pendingPayout.eth} ETH${colors.reset} (${pendingData.pendingPayout.gwei} gwei)`
          );
          console.log("");
        } catch (e) {
          error(`Failed to get pending payout: ${(e as Error).message}`);
        }
        break;

      case "history":
        try {
          if (!APPLICATION_URL) {
            error("APPLICATION_URL not configured");
            console.log(
              `${colors.cyan}Please add APPLICATION_URL to your config file or environment variables${colors.reset}`
            );
            console.log(
              `${colors.yellow}Example: https://your-application-domain.com${colors.reset}`
            );
            break;
          }
          info("Fetching payout history...");
          const historyData = await validator.getPayoutHistory(APPLICATION_URL);
          console.log("");
          success("Payout History:");
          console.log(
            `  Validator ID: ${colors.cyan}${historyData.validatorId}${colors.reset}`
          );
          console.log(
            `  Public Key: ${colors.cyan}${historyData.publicKey}${colors.reset}`
          );
          console.log("");
          console.log(`${colors.cyan}Summary:${colors.reset}`);
          console.log(
            `  Total Payouts: ${colors.yellow}${historyData.summary.totalPayouts}${colors.reset}`
          );
          console.log(
            `  Completed: ${colors.green}${historyData.summary.completedPayouts}${colors.reset}`
          );
          console.log(
            `  Total Paid: ${colors.green}${historyData.summary.totalPaidEth} ETH${colors.reset}`
          );
          console.log("");
          if (historyData.payouts.length > 0) {
            console.log(`${colors.cyan}Recent Payouts:${colors.reset}`);
            historyData.payouts.slice(0, 10).forEach((payout: any) => {
              const date = new Date(payout.processedAt).toLocaleString();
              const status =
                payout.status === "Completed"
                  ? `${colors.green}${payout.status}${colors.reset}`
                  : `${colors.yellow}${payout.status}${colors.reset}`;
              console.log(
                `  [${date}] ${payout.amount} ${payout.currency} - ${status}`
              );
              if (payout.txHash) {
                console.log(
                  `    TX: ${colors.cyan}${payout.txHash}${colors.reset}`
                );
              }
            });
          } else {
            console.log(
              `  ${colors.yellow}No payout history found${colors.reset}`
            );
          }
          console.log("");
        } catch (e) {
          error(`Failed to get payout history: ${(e as Error).message}`);
        }
        break;

      case "withdraw":
        try {
          if (!APPLICATION_URL) {
            error("APPLICATION_URL not configured");
            console.log(
              `${colors.cyan}Please add APPLICATION_URL to your config file or environment variables${colors.reset}`
            );
            console.log(
              `${colors.yellow}Example: https://your-application-domain.com${colors.reset}`
            );
            break;
          }
          info("Requesting payout...");
          const payoutData = await validator.requestPayout(APPLICATION_URL);
          console.log("");
          success("Payout processed successfully!");
          console.log(
            `  Amount: ${colors.green}${payoutData.payout.amount} ${payoutData.payout.currency}${colors.reset}`
          );
          console.log(
            `  Status: ${colors.green}${payoutData.payout.status}${colors.reset}`
          );
          if (payoutData.payout.txHash) {
            console.log(
              `  Transaction Hash: ${colors.cyan}${payoutData.payout.txHash}${colors.reset}`
            );
          }
          console.log("");
        } catch (e) {
          error(`Failed to request payout: ${(e as Error).message}`);
        }
        break;

      case "exit":
      case "quit":
        info("Shutting down validator...");
        rl.close();
        try {
          validator.disconnect();
          success("Disconnected from hub");
        } catch {}
        return;

      case "":
        break;

      default:
        warning(`Unknown command: ${cmd}`);
        console.log(
          `Type ${colors.cyan}help${colors.reset} for available commands`
        );
    }

    rl.prompt();
  }).on("close", () => {
    info("Goodbye!");
    process.exit(0);
  });

  rl.prompt();

  process.on("SIGINT", () => {
    console.log("");
    info("Received shutdown signal");
    try {
      validator.disconnect();
      success("Validator disconnected");
    } catch (e) {
      warning(`Error during disconnect: ${(e as Error).message}`);
    }
    info("Exiting...");
    process.exit(0);
  });
}

startCli().catch((err) => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
