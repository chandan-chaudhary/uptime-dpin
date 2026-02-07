import { useState } from "react";
import { createValidatorFromBrowserWallet } from "@uptime-dpin/validator-core";
import { UptimeValidator } from "@uptime-dpin/validator-core";
import { OutgoingMessage } from "@common/index";
import { HUB_URL, PROXY_URL } from "@/lib/utils";


export function useValidatorServices() {
  const [isConnected, setIsConnected] = useState(false);
  const [validatorId, setValidatorId] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [status, setStatus] = useState<string>("disconnected");
  const [logs, setLogs] = useState<string[]>([]);
  const [validator, setValidator] = useState<UptimeValidator | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        addLog("❌ MetaMask not found! Please install MetaMask.");
        return;
      }

      addLog("🔌 Connecting to MetaMask...");

      // Create validator from browser wallet
      const config = await createValidatorFromBrowserWallet(HUB_URL);
      // Add proxy URL to config
      config.proxyUrl = PROXY_URL;
      const validatorInstance = new UptimeValidator(config);

      // Initialize to get public key
      await validatorInstance.initialize();
      const address = validatorInstance.getPublicKey();

      setWalletAddress(address);
      setValidator(validatorInstance);
      addLog(
        `✅ Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      );

      // Listen to validator events
      validatorInstance.on("hub", (message: OutgoingMessage) => {
        addLog(`📨 Hub message: ${message.type}`);
        if (message.type === "signup") {
          addLog(`🆔 Registered with ID: ${message.data.validatorId}`);
        } else if (message.type === "validate") {
          addLog(`🌐 Validating website: ${message.data.url}`);
        }
      });

      // Listen to log events from validator
      validatorInstance.on("log", (logMessage: string) => {
        addLog(logMessage);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        addLog(`❌ Failed to connect wallet: ${error.message}`);
      } else {
        addLog(`❌ Failed to connect wallet: ${String(error)}`);
      }
    }
  };

  const startValidator = async () => {
    if (!validator) {
      addLog("❌ Please connect wallet first");
      return;
    }

    try {
      addLog("🚀 Starting validator...");
      setStatus("connecting");
      await validator.connect();
      setStatus("connected");
      setIsConnected(true);
      addLog("✅ Validator connected to hub");

      // Get validator ID after a short delay
      setTimeout(() => {
        const id = validator.getValidatorId();
        if (id) {
          setValidatorId(id);
          addLog(`🆔 Validator ID: ${id}`);
        }
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        addLog(`❌ Failed to start validator: ${error.message}`);
      } else {
        addLog(`❌ Failed to start validator: ${String(error)}`);
      }
      setStatus("error");
    }
  };

  const stopValidator = () => {
    if (validator) {
      addLog("🛑 Stopping validator...");
      validator.disconnect();
      setIsConnected(false);
      setStatus("disconnected");
      setValidatorId("");
      addLog("✅ Validator stopped");
    }
  };

  const getPendingPayout = async () => {
    if (!validator) {
      addLog("❌ Validator not running");
      return;
    }

    try {
      addLog("💰 Fetching pending payout...");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      const payout = await validator.getPendingPayout(apiUrl);
      addLog(
        `💰 Pending: ${payout.pendingPayout.eth} ETH (${payout.pendingPayout.gwei} Gwei)`,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        addLog(`❌ Failed to fetch payout: ${error.message}`);
      } else {
        addLog(`❌ Failed to fetch payout: ${String(error)}`);
      }
    }
  };

  return {
    // State
    isConnected,
    validatorId,
    walletAddress,
    status,
    logs,
    validator,

    // Functions
    connectWallet,
    startValidator,
    stopValidator,
    getPendingPayout,
    addLog,
  };
}
