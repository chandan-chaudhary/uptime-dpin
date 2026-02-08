import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "@repo/db";
// import { PrismaClient } from "@repo/db";
// import { PrismaClient, WebsiteStatus } from "@repo/db";
import { createServer } from "http";
import { ethers } from "ethers";
import {
  IncomingMessage,
  OutgoingMessage,
  SignupIncomingMessage,
  ValidateIncomingMessage,
} from "@common/index";
import { randomUUID } from "crypto";

// Types
interface ValidatorConnection {
  ws: WebSocket;
  publicKey: string;
  validatorId: string;
  // lastHeartbeat: Date;
  // isAuthenticated: boolean;
  //   ipAddress: string;
  // location: string;
}

// Hub Server
export class UptimeHub {
  private wss: WebSocketServer;
  private validators: Map<
    ValidatorConnection["validatorId"],
    ValidatorConnection
  > = new Map();
  private CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } =
    {};
  private COST_PER_VALIDATION = 10; // 0.01 ETH in Gwei (1 ETH = 1,000,000,000 Gwei, so 0.01 ETH = 10,000,000 Gwei)
  private activeWebsites: Set<string> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(port: number = 8080) {
    const server = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hub is running");
    });
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", this.handleConnection.bind(this));

    server.listen(port, () => {
      console.log(`🚀 Uptime Hub started on port ${port}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${port}`);
    });

    // Start periodic tasks
    // this.startHeartbeatMonitor();
    // this.startWebsiteCheckDispatcher();
    // Monitor websites
    this.startWebsiteMonitoring();
  }

  private handleConnection(ws: WebSocket, req: any) {
    const clientIp = req.socket.remoteAddress;
    console.log(`🔌 New connection from ${clientIp}`);

    ws.onmessage = async (event: WebSocket.MessageEvent) => {
      try {
        const message: IncomingMessage = JSON.parse(event.data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error("❌ Error handling message:", error);
        // this.sendError(ws, "Invalid message format");
      }
    };

    ws.onclose = () => {
      const validator = this.findValidatorByWs(ws);
      if (validator) {
        console.log(`🔌 Validator disconnected: ${validator.publicKey}`);
        // 🔥 REMOVE: Delete validator from Map (like array.splice or filter)
        this.validators.delete(validator.validatorId);
        console.log(this.validators);

        console.log(`📊 Remaining validators: ${this.validators.size}`);
      }
    };

    ws.onerror = (error: WebSocket.ErrorEvent) => {
      console.error("❌ WebSocket error:", error);
    };
  }

  // Handle incoming messages
  private async handleMessage(ws: WebSocket, message: IncomingMessage) {
    if (message.type === "signup") {
      await this.handleRegister(ws, message.data);
      return;
    }
    if (message.type === "validate") {
      this.handleValidate(ws, message.data);
      return;
    }
  }

  // Handle signup/register message
  private async handleRegister(ws: WebSocket, payload: SignupIncomingMessage) {
    const verified = await this.verifySignupPayload(
      `This is signed message for ${payload.publicKey}, ${payload.callbackId}`,
      payload.publicKey,
      payload.signedMessage,
    );
    if (verified) {
      await this.handleSignUp(ws, payload);
    }
  }

  // Handle validate message
  private handleValidate(ws: WebSocket, payload: ValidateIncomingMessage) {
    const callback = this.CALLBACKS[payload.callbackId];
    if (callback) {
      // 🔥 FIX: Pass the complete message structure with type and data
      callback({
        type: "validate",
        data: payload,
      });
      delete this.CALLBACKS[payload.callbackId];
    }
  }

  /**
   * Verify Ethereum signature
   *
   * How it works:
   * 1. Validator signs message with their private key
   * 2. Hub receives: message, signature, and publicKey (Ethereum address)
   * 3. Hub recovers the signer's address from signature
   * 4. If recovered address matches publicKey, signature is valid
   *
   * @param message - Original message that was signed
   * @param publicKey - Ethereum address (0x...)
   * @param signature - Hex signature (0x...)
   * @returns true if signature is valid
   */
  private async verifySignupPayload(
    message: string,
    publicKey: string,
    signature: string,
  ): Promise<boolean> {
    try {
      // Validate inputs
      if (!message || !publicKey || !signature) {
        console.error("❌ Missing required fields for verification");
        return false;
      }

      // Validate Ethereum address format
      if (!ethers.isAddress(publicKey)) {
        console.error("❌ Invalid Ethereum address format:", publicKey);
        return false;
      }

      const recoveredAddress = ethers.verifyMessage(message, signature);

      // Compare recovered address with claimed public key (case-insensitive)
      const isValid =
        recoveredAddress.toLowerCase() === publicKey.toLowerCase();

      if (isValid) {
        console.log(`✅ Signature verified for address: ${publicKey}`);
      } else {
        console.error(
          `❌ Signature verification failed!\n` +
            `   Expected: ${publicKey}\n` +
            `   Recovered: ${recoveredAddress}`,
        );
      }

      return isValid;
    } catch (error) {
      console.error("❌ Error verifying signature:", error);
      return false;
    }
  }

  // Handle signup after signature verification
  private async handleSignUp(ws: WebSocket, payload: SignupIncomingMessage) {
    console.log(
      "✅ Signature verified, processing signup:",
      payload.publicKey,
      payload.ip,
      payload.location,
    );

    const validator = await prisma.validator.findUnique({
      where: { publicKey: payload.publicKey },
    });

    if (validator) {
      console.log("⚠️ Validator already exists:", validator.id);
      // Send success response
      this.send(ws, {
        type: "signup",
        data: {
          validatorId: validator.id,
          callbackId: payload.callbackId,
        },
      });

      // Update existing validator connection
      this.validators.set(validator.id, {
        ws,
        publicKey: payload.publicKey,
        validatorId: validator.id,
      });

      console.log(`📊 Active validators: ${this.validators.size}`);
      return;
    }
    // Create new validator
    const newValidator = await prisma.validator.create({
      data: {
        publicKey: payload.publicKey,
        location: payload.location || "Unknown",
        ipAddress: payload.ip || "Unknown",
      },
    });
    console.log(
      "✅ New validator registered:",
      newValidator.id,
      payload.ip,
      payload.location,
    );

    // 🔥 PUSH: Add validator to Map
    this.validators.set(newValidator.id, {
      ws,
      publicKey: payload.publicKey,
      validatorId: newValidator.id,
    });

    // Send success response
    this.send(ws, {
      type: "signup",
      data: {
        validatorId: newValidator.id,
        callbackId: payload.callbackId,
      },
    });

    console.log(`📊 Active validators: ${this.validators.size}`);
  }

  // Monitor websites by dispatching validate tasks to validators
  private startWebsiteMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        const websitesToMonitor = await prisma.website.findMany({
          where: { disabled: false },
        });
        if (!websitesToMonitor.length) return;
        for (const website of websitesToMonitor) {
          console.log(`🌐 Checking website: ${website.url}`);
          const callbackId = randomUUID(); // generate unique callback ID from crypto module
          this.validators.forEach((validator) => {
            const validateMessage = {
              type: "validate",
              data: {
                url: website.url,
                callbackId: callbackId,
              },
            };
            // send validate message to validator
            validator.ws.send(JSON.stringify(validateMessage));

            // register callback to handle response
            this.CALLBACKS[callbackId] = async (data: IncomingMessage) => {
              console.log(
                "Received validate response from validator:",
                data.type,
              );
              if (data.type === "validate") {
                const { status, latency, signedMessage, validatorId } =
                  data.data;
                // Verify the signature
                // const verified = await this.verifySignupPayload(
                //   `This is signed message for ${validator.publicKey}, ${data.data.callbackId}`,
                //   validator.publicKey,
                //   signedMessage
                // );

                // if (!verified) {
                //   console.error(
                //     "❌ Incoming validation signature verification failed"
                //   );
                //   return;
                // }
                // Record the tick in a transaction
                try {
                  await prisma.$transaction(async (tx) => {
                    // Record the tick
                    await tx.websiteTick.create({
                      data: {
                        websiteId: website.id,
                        validatorId: validator.validatorId, // ✅ Use validator.validatorId (UUID) not data.data.validatorId (Ethereum address)
                        status: status,
                        latency: latency,
                      },
                    });
                    await tx.validator.update({
                      where: { id: validator.validatorId }, // ✅ Also fix this
                      data: {
                        pendingPayout: { increment: this.COST_PER_VALIDATION },
                      },
                    });
                  });
                } catch (txError) {
                  console.error("❌ Error recording website tick:", txError);
                }
              }
            };
          });
        }
      } catch (error) {
        console.error("❌ Error in website monitoring:", error);
        // Continue running - don't crash the hub
      }
    }, 60 * 1000);
  }

  // Send message to validator (so it become Incoming for validator)
  private send(ws: WebSocket, message: OutgoingMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Find validator by WebSocket
  private findValidatorByWs(ws: WebSocket): ValidatorConnection | undefined {
    for (const validator of this.validators.values()) {
      if (validator.ws === ws) {
        return validator;
      }
    }
    return undefined;
  }

  public getStats() {
    return {
      activeValidators: this.validators.size,
      activeWebsites: this.activeWebsites.size,
      validators: Array.from(this.validators.values()).map((v) => ({
        publicKey: v.publicKey,
        // location: v.location,
        // lastHeartbeat: v.lastHeartbeat,
      })),
    };
  }

  public stop() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.monitoringInterval) clearInterval(this.monitoringInterval);
    this.wss.close();
    prisma.$disconnect();
  }
}

// Start the hub
const hub = new UptimeHub(Number(process.env.HUB_PORT) || 8080);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down hub...");
  hub.stop();
  process.exit(0);
});

// Log stats every minute
setInterval(() => {
  const stats = hub.getStats();
  console.log(
    `📊 Stats: ${stats.activeValidators} validators, ${stats.activeWebsites} websites`,
  );
}, 60000);
