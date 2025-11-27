#!/usr/bin/env node
import "dotenv/config";
import readline from "readline";
import { UptimeValidator } from "./validator";

const HUB_URL = process.env.HUB_URL || "ws://localhost:8080";
const PRIVATE_KEY = process.env.VALIDATOR_PRIVATE_KEY || "";
const PUBLIC_KEY = process.env.VALIDATOR_PUBLIC_KEY || "";

if (!PRIVATE_KEY || !PUBLIC_KEY) {
  console.warn(
    "Warning: PRIVATE_KEY or PUBLIC_KEY env not set. You can still run the CLI but registration/signing will fail."
  );
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

async function startCli() {
  console.log(`Validator CLI starting — hub: ${HUB_URL}`);

  const autoConnect = !process.argv.includes("--no-auto-connect");

  // Create validator in quiet mode (no console.log interruptions during typing)
  const validator = new UptimeValidator(HUB_URL, PUBLIC_KEY, PRIVATE_KEY);

  if (autoConnect) {
    try {
      validator.connect();
      console.log("Validator: connecting to hub (auto)");
    } catch (e) {
      console.error("Validator connect failed:", e);
    }
  } else {
    console.log("Validator: auto-connect disabled (use 'start' to connect)");
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
        validator.connect();
        await new Promise((res) => setTimeout(res, 400));
      }
    } catch (e) {
      console.error("ensureConnected error:", e);
    }
  }

  rl.on("line", async (line) => {
    const parts = line.trim().split(/\s+/);
    const cmd = parts[0];

    switch (cmd) {
      case "help":
        console.log(
          `commands: register | start | status | pending | payouts | withdraw <payoutId> | exit`
        );
        break;

      case "status":
        console.log(getStatus());
        break;

      case "register":
        await ensureConnected();
        console.log("-> connect (registration will be sent on open)");
        break;

      case "start":
        await ensureConnected();
        console.log("-> started (connect requested)");
        break;

      case "pending":
        await ensureConnected();
        await validator.pendingSummary();
        console.log("-> pending_summary requested");
        break;

      case "payouts":
        await ensureConnected();
        await validator.pendingList();
        console.log("-> pending_list requested");
        break;

      case "withdraw": {
        const payoutId = parts[1];
        if (!payoutId) {
          console.log("usage: withdraw <payoutId>");
          break;
        }
        await ensureConnected();
        await validator.requestWithdraw(payoutId);
        console.log(`-> withdraw URL requested for ${payoutId}`);
        break;
      }

      case "exit":
      case "quit":
        rl.close();
        try {
          validator.disconnect();
        } catch {}
        return;

      case "":
        break;

      default:
        console.log("unknown command. type 'help'");
    }

    rl.prompt();
  }).on("close", () => {
    console.log("bye");
    process.exit(0);
  });

  rl.prompt();

  process.on("SIGINT", () => {
    try {
      validator.disconnect();
    } catch {}
    console.log("\nStopping CLI");
    process.exit(0);
  });
}

startCli().catch((err) => {
  console.error("cli error:", err);
  process.exit(1);
});
