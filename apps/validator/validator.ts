import "dotenv/config";
import WebSocket from "ws";
import axios from "axios";
import {
  IncomingMessage,
  OutgoingMessage,
  SignupOutgoingMessage,
  ValidateOutgoingMessage,
} from "@common/index";
import { ethers } from "ethers";
import { randomUUID } from "crypto";
import {WebsiteStatus} from "@repo/db";

// Validator Client
export class UptimeValidator {
  private ws: WebSocket | null = null;
  private hubUrl: string;
  private CALLBACKS: {
    [callbackId: string]: (data: SignupOutgoingMessage) => void;
  } = {};
  private publicKey: string;
  private privateKey: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private validatorId: string;

  constructor(hubUrl: string, publicKey: string, privateKey: string) {
    this.hubUrl = hubUrl;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.validatorId = "";
  }

  public connect() {
    console.log(`🔌 Connecting to hub at ${this.hubUrl}...`);

    this.ws = new WebSocket(this.hubUrl);

    // Setup event handlers
    this.ws.onopen = async () => {
      console.log("✅ Connected to hub");
      const callbackId = randomUUID();
      this.CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
        this.validatorId = data.validatorId;
      };
      const signedMessage = await this.signMessage(
        `This is signed message for ${this.publicKey}, ${callbackId}`
      );
      this.send({
        type: "signup",
        data: {
          ip: "0.0.0.0",
          publicKey: this.publicKey,
          signedMessage,
          callbackId,
        },
      });
    };

    // Handle incoming messages
    this.ws.onmessage = (event: WebSocket.MessageEvent) => {
      try {
        const message: OutgoingMessage = JSON.parse(event.data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error("❌ Error parsing message:", error);
      }
    };

    // Handle connection close
    this.ws.onclose = () => {
      console.log("🔌 Disconnected from hub");
    };

    // Handle errors
    this.ws.onerror = (event: WebSocket.ErrorEvent) => {
      console.error("❌ WebSocket error:", event.message);
    };
  }

  // Handle incoming messages from hub
  private async handleMessage(message: OutgoingMessage) {
    if (message.type === "signup") {
      const { callbackId, validatorId } = message.data;
      console.log(`✅ Registered with hub. Validator ID: ${validatorId}`);

      const callback = this.CALLBACKS[callbackId];
      if (callback) {
        callback(message.data);
        delete this.CALLBACKS[callbackId];
      }
    }
    if (message.type === "validate") {
      await this.validateHandler(message.data);
    }
  }

  // Handle validate task
  private async validateHandler(data: ValidateOutgoingMessage) {
    const signedMessage = await this.signMessage(
      `This is signed message for ${this.publicKey}, ${data.callbackId}`
    );
    const startTime = Date.now();
    try {
      const response = await axios.get(data.url);
      const latency = Date.now() - startTime;
      const status =
        response.status === 200 ? WebsiteStatus.Good : WebsiteStatus.Bad;
        console.log(`${data.url}: ${response.status}, ${latency}ms, in Validator`);
        
      this.send({
        type: "validate",
        data: {
          callbackId: data.callbackId,
          status,
          latency,
          websiteId: data.websiteId,
          validatorId: this.publicKey,
          signedMessage,
        },
      });
    } catch (error) {
      this.send({
        type: "validate",
        data: {
          callbackId: data.callbackId,
          status: WebsiteStatus.Bad,
          latency: Date.now() - startTime,
          websiteId: data.websiteId,
          validatorId: this.publicKey,
          signedMessage,
        },
      });
    }
  }

  // Sign message with validator's private key
  private async signMessage(message: string): Promise<string> {
    try {
      // Create wallet from private key
      const wallet = new ethers.Wallet(this.privateKey);

      // Sign the message
      const signature = await wallet.signMessage(message);

      return signature;
    } catch (error) {
      console.error("❌ Error signing message:", error);
      throw new Error("Failed to sign message");
    }
  }

  // Send message to hub (so it become IcomingMessage for hub)
  private send(message:any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ Cannot send message, not connected");
    }
  }

  // Disconnect from hub
  public disconnect() {
    // this.stopHeartbeat();
    // this.stopAllChecks();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Start validator
const HUB_URL = process.env.HUB_URL || "ws://localhost:8080";
const PUBLIC_KEY =
  process.env.VALIDATOR_PUBLIC_KEY ||
  `validator_${Math.random().toString(36).substring(7)}`;
const PRIVATE_KEY =
  process.env.VALIDATOR_PRIVATE_KEY ||
  `private_key_${Math.random().toString(36).substring(7)}`;
const LOCATION = process.env.VALIDATOR_LOCATION || "Local Development";

console.log("🚀 Starting Uptime Validator");
console.log(`📍 Location: ${LOCATION}`);
console.log(`🔑 Public Key: ${PUBLIC_KEY}`);

const validator = new UptimeValidator(HUB_URL, PUBLIC_KEY, PRIVATE_KEY);
validator.connect();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down validator...");
  validator.disconnect();
  process.exit(0);
});
