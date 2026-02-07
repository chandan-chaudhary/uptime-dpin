import { ethers } from "ethers";
import { HttpClient, WebSocketFactory, UUIDGenerator, Logger } from "./core";

// Validation types
export interface ValidationResult {
  status: "Good" | "Bad";
  latency: number;
  actualStatus: number;
}

export interface ValidationTask {
  url: string;
  websiteId: string;
  callbackId: string;
}

// Configuration
export interface ValidatorConfig {
  hubUrl: string;
  signer: ethers.Signer;
  httpClient: HttpClient;
  wsFactory: WebSocketFactory;
  uuidGenerator: UUIDGenerator;
  logger?: Logger;
  proxyUrl?: string;
  reconnectConfig?: ReconnectConfig;
}

export interface ReconnectConfig {
  baseDelay: number;
  maxDelay: number;
  maxAttempts: number;
  jitterFactor: number;
}

// Connection states
export enum ConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
}

// Error types
export class ValidatorError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "ValidatorError";
  }
}

export class ConnectionError extends ValidatorError {
  constructor(message: string, cause?: Error) {
    super(message, "CONNECTION_ERROR", cause);
    this.name = "ConnectionError";
  }
}

export class ValidationError extends ValidatorError {
  constructor(message: string, cause?: Error) {
    super(message, "VALIDATION_ERROR", cause);
    this.name = "ValidationError";
  }
}

export class ApiError extends ValidatorError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    cause?: Error
  ) {
    super(message, "API_ERROR", cause);
    this.name = "ApiError";
  }
}
