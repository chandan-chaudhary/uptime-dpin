// Connection constants
export const DEFAULT_RECONNECT_CONFIG = {
  baseDelay: 500, // ms
  maxDelay: 30000, // ms
  maxAttempts: 10,
  jitterFactor: 0.3,
} as const;

// HTTP constants
export const HTTP_TIMEOUT = 10000; // 10 seconds
export const VALIDATION_TIMEOUT = 15000; // 15 seconds for website checks

// Status codes
export const HTTP_SUCCESS_STATUS = 200;
export const HTTP_REDIRECT_STATUSES = [301, 302, 303, 307, 308];

// API endpoints
export const IP_API_ENDPOINTS = {
  primary: "https://ipapi.co/json/",
  fallback: "http://ip-api.com/json/",
} as const;

// Validation constants
export const VALIDATION_STATUS = {
  GOOD: "Good",
  BAD: "Bad",
} as const;

// Message types
export const MESSAGE_TYPES = {
  SIGNUP: "signup",
  VALIDATE: "validate",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NOT_INITIALIZED: "Validator not initialized. Call initialize() first.",
  NOT_REGISTERED: "Validator not registered. Please connect to hub first.",
  CONNECTION_FAILED: "Failed to connect to hub",
  VALIDATION_FAILED: "Website validation failed",
  SIGNATURE_FAILED: "Failed to sign message",
  API_UNREACHABLE:
    "Cannot reach API. Check configuration and internet connection.",
} as const;
