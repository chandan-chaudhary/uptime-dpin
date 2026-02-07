import { OutgoingMessage, SignupOutgoingMessage } from "@common/index";

// Import all the new services and interfaces
import { Logger, EventEmitter } from "./interfaces/core";
import {
  ValidatorConfig,
  ConnectionState,
  ValidatorError,
} from "./interfaces/validation";
import {
  PendingPayoutResponse,
  PayoutHistoryResponse,
  PayoutRequestResponse,
} from "./interfaces/api";
import { ERROR_MESSAGES } from "./constants";

// Import service classes
import { ConnectionManager } from "./services/ConnectionManager";
import { MessageHandler } from "./services/MessageHandler";
import { ValidationService } from "./services/ValidationService";
import { SignatureService } from "./services/SignatureService";
import { LocationService } from "./services/LocationService";
import { PayoutService } from "./services/PayoutService";

// Import utilities
import { ConsoleLogger } from "./utils/ConsoleLogger";
import { SimpleEventEmitter } from "./utils/SimpleEventEmitter";

// Validator Client (Platform-Agnostic) - Optimized with Service Pattern
export class UptimeValidator {
  private validatorId: string = "";
  private publicKey: string = "";
  private initialized = false;
  private readonly hubUrl: string;

  // Service dependencies
  private readonly connectionManager: ConnectionManager;
  private readonly messageHandler: MessageHandler;
  private readonly validationService: ValidationService;
  private readonly signatureService: SignatureService;
  private readonly locationService: LocationService;
  private readonly payoutService: PayoutService;
  private readonly logger: Logger;
  private readonly eventEmitter: EventEmitter;

  // Public emitter for backward compatibility
  public readonly emitter: EventEmitter;

  constructor(config: ValidatorConfig) {
    this.hubUrl = config.hubUrl;

    // Initialize logger and event emitter with defaults if not provided
    this.logger = config.logger || new ConsoleLogger();
    this.eventEmitter = new SimpleEventEmitter();
    this.emitter = this.eventEmitter; // Public access to emitter

    // Initialize services
    this.connectionManager = new ConnectionManager(
      config.wsFactory,
      this.logger,
      this.eventEmitter,
      config.reconnectConfig,
    );

    this.signatureService = new SignatureService(config.signer, this.logger);
    this.locationService = new LocationService(config.httpClient, this.logger);
    this.validationService = new ValidationService(
      config.httpClient,
      this.logger,
      config.proxyUrl,
    );
    this.payoutService = new PayoutService(config.httpClient, this.logger);

    this.messageHandler = new MessageHandler(
      this.validationService,
      this.signatureService,
      this.locationService,
      config.uuidGenerator,
      this.logger,
      this.eventEmitter,
    );

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Initialize the validator (get public key)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.publicKey = await this.signatureService.getPublicKey();
      this.initialized = true;
      this.logger.info(
        `🔑 Validator initialized with address: ${this.publicKey}`,
      );
    } catch (error) {
      throw new ValidatorError(
        ERROR_MESSAGES.NOT_INITIALIZED,
        "INITIALIZATION_ERROR",
        error as Error,
      );
    }
  }

  /**
   * Connect to the hub
   */
  async connect(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    // The connection manager will handle the connection
    // When connected, we'll send the signup message
    await this.connectionManager.connect(this.hubUrl);
  }

  /**
   * Disconnect from the hub
   */
  disconnect(): void {
    this.connectionManager.disconnect();
  }

  /**
   * Get validator ID (useful for debugging)
   */
  getValidatorId(): string {
    return this.validatorId;
  }

  /**
   * Get public key
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Get pending payout from API
   */
  async getPendingPayout(apiUrl: string): Promise<PendingPayoutResponse> {
    return this.payoutService.getPendingPayout(apiUrl, this.validatorId);
  }

  /**
   * Get payout history from API
   */
  async getPayoutHistory(apiUrl: string): Promise<PayoutHistoryResponse> {
    return this.payoutService.getPayoutHistory(apiUrl, this.validatorId);
  }

  /**
   * Request payout via API
   */
  async requestPayout(apiUrl: string): Promise<PayoutRequestResponse> {
    return this.payoutService.requestPayout(apiUrl, this.validatorId);
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionManager.getState();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  private setupEventHandlers(): void {
    // Handle connection established
    this.eventEmitter.on("connected", async () => {
      try {
        const { message } = await this.messageHandler.createSignupData(
          this.publicKey,
        );
        this.connectionManager.send(message);
      } catch (error: any) {
        this.logger.error(`Failed to send signup message: ${error?.message}`);
      }
    });

    // Handle incoming messages
    this.eventEmitter.on("message", async (message: OutgoingMessage) => {
      // Emit raw hub message for listeners (CLI, tests)
      await this.messageHandler.handleMessage(message);
      this.eventEmitter.emit("hub", message);
    });

    // Handle registration
    this.eventEmitter.on("registered", (data: SignupOutgoingMessage) => {
      this.validatorId = data.validatorId;
    });

    // Handle validation responses
    this.eventEmitter.on("validationResponse", (response: any) => {
      this.connectionManager.send(response);
    });

    // Handle reconnection
    this.eventEmitter.on("reconnect", async () => {
      try {
        await this.connectionManager.connect(this.hubUrl);
      } catch (error: any) {
        this.logger.error(`Reconnection failed: ${error?.message}`);
      }
    });
  }
}
