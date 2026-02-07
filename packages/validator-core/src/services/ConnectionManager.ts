import {
  WebSocketClient,
  WebSocketFactory,
  Logger,
  EventEmitter,
} from "../interfaces/core";
import {
  ConnectionState,
  ReconnectConfig,
  ConnectionError,
} from "../interfaces/validation";
import { DEFAULT_RECONNECT_CONFIG } from "../constants";

/**
 * Manages WebSocket connection with automatic reconnection
 */
export class ConnectionManager {
  private ws: WebSocketClient | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private manualClose = false;

  constructor(
    private readonly wsFactory: WebSocketFactory,
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly config: ReconnectConfig = DEFAULT_RECONNECT_CONFIG
  ) {}

  /**
   * Connect to the WebSocket endpoint
   */
  async connect(url: string): Promise<void> {
    if (this.isConnected() || this.state === ConnectionState.CONNECTING) {
      this.logger.info("🔌 WebSocket already connected or connecting");
      return;
    }

    this.manualClose = false;
    this.state = ConnectionState.CONNECTING;
    this.logger.info(`🔌 Connecting to ${url}...`);

    try {
      this.ws = this.wsFactory.create(url);
      this.setupEventHandlers();
    } catch (error: any) {
      this.state = ConnectionState.DISCONNECTED;
      throw new ConnectionError(
        `Failed to create WebSocket connection: ${error?.message}`,
        error
      );
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.manualClose = true;
    this.state = ConnectionState.DISCONNECTED;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (error: any) {
        this.logger.warn(`Error closing WebSocket: ${error?.message}`);
      }
      this.ws = null;
    }

    this.logger.info("🔌 Disconnected from WebSocket");
  }

  /**
   * Send a message through the WebSocket
   */
  send(message: any): void {
    if (this.ws && this.isConnected()) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.logger.warn("⚠️ Cannot send message, not connected");
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return (
      this.state === ConnectionState.CONNECTED &&
      this.ws?.readyState === this.wsFactory.OPEN
    );
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.logger.info("✅ Connected to WebSocket");
      this.state = ConnectionState.CONNECTED;
      this.reconnectAttempts = 0;

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      this.eventEmitter.emit("connected");
    };

    this.ws.onmessage = (event: any) => {
      try {
        const message = JSON.parse(
          event.data?.toString ? event.data.toString() : event.data
        );
        this.eventEmitter.emit("message", message);
      } catch (error: any) {
        this.logger.error(`❌ Error parsing message: ${error?.message}`);
      }
    };

    this.ws.onclose = (event: any) => {
      this.logger.info(`🔌 WebSocket closed: ${event?.code} ${event?.reason}`);
      this.state = ConnectionState.DISCONNECTED;

      if (!this.manualClose) {
        this.scheduleReconnect();
      }

      this.eventEmitter.emit("disconnected", event);
    };

    this.ws.onerror = (event: any) => {
      this.logger.error(`❌ WebSocket error: ${event?.message || event}`);
      this.eventEmitter.emit("error", event);
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxAttempts) {
      this.logger.error("❌ Max reconnection attempts reached");
      this.eventEmitter.emit("maxReconnectAttemptsReached");
      return;
    }

    this.reconnectAttempts++;
    this.state = ConnectionState.RECONNECTING;

    const baseDelay =
      this.config.baseDelay * Math.pow(2, this.reconnectAttempts - 1);
    const expDelay = Math.min(baseDelay, this.config.maxDelay);
    const jitter = Math.floor(
      Math.random() * expDelay * this.config.jitterFactor
    );
    const delay = expDelay + jitter;

    this.logger.info(
      `🔁 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      if (this.manualClose) return;

      // Re-emit the connection event to trigger reconnection
      this.eventEmitter.emit("reconnect");
    }, delay);
  }
}
