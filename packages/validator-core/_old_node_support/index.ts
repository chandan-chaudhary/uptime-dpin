// Main export for Node.js environments
export { UptimeValidator } from "./validator";
export type {
  ValidatorConfig,
  HttpClient,
  WebSocketClient,
  WebSocketFactory,
  UUIDGenerator,
  PendingPayoutResponse,
  PayoutHistoryResponse,
  PayoutRequestResponse,
  ApiErrorResponse,
} from "./validator";

// Node.js-specific exports
export {
  AxiosHttpClient,
  NodeWebSocketFactory,
  NodeUUIDGenerator,
  createValidatorFromPrivateKey,
  createValidatorFromSigner,
} from "./node";
