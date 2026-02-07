// Browser adapters for platform-agnostic validator
import { ethers } from "ethers";
import {
  HttpClient,
  WebSocketClient,
  WebSocketFactory,
  UUIDGenerator,
} from "./interfaces/core";
import { ValidatorConfig } from "./interfaces/validation";

// Fetch API HTTP client adapter
export class FetchHttpClient implements HttpClient {
  async get<T = any>(url: string): Promise<{ data: T; status: number }> {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Cache-Control": "max-age=0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // For website uptime checking, we don't need to parse the body
      // Just return the status code
      let data: any = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      return { data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async post<T = any>(
    url: string,
    bodyData?: any
  ): Promise<{ data: T; status: number }> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyData ? JSON.stringify(bodyData) : undefined,
    });
    const data = await response.json();
    return { data, status: response.status };
  }
}

// Browser WebSocket adapter
class BrowserWebSocketAdapter implements WebSocketClient {
  private ws: WebSocket;

  constructor(url: string) {
    this.ws = new WebSocket(url);
  }

  get readyState(): number {
    return this.ws.readyState;
  }

  get onopen() {
    return this.ws.onopen;
  }
  set onopen(handler: ((event: any) => void) | null) {
    this.ws.onopen = handler;
  }

  get onmessage() {
    return this.ws.onmessage;
  }
  set onmessage(handler: ((event: any) => void) | null) {
    this.ws.onmessage = handler;
  }

  get onclose() {
    return this.ws.onclose;
  }
  set onclose(handler: ((event: any) => void) | null) {
    this.ws.onclose = handler;
  }

  get onerror() {
    return this.ws.onerror;
  }
  set onerror(handler: ((event: any) => void) | null) {
    this.ws.onerror = handler;
  }

  send(data: string): void {
    this.ws.send(data);
  }

  close(): void {
    this.ws.close();
  }
}

export class BrowserWebSocketFactory implements WebSocketFactory {
  readonly OPEN = WebSocket.OPEN;
  readonly CONNECTING = WebSocket.CONNECTING;

  create(url: string): WebSocketClient {
    return new BrowserWebSocketAdapter(url);
  }
}

// Browser UUID generator
export class BrowserUUIDGenerator implements UUIDGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}

// Helper to create validator config from browser wallet (MetaMask, etc.)
export async function createValidatorFromBrowserWallet(
  hubUrl: string,
  provider?: ethers.BrowserProvider
): Promise<ValidatorConfig> {
  // Use provided provider or create from window.ethereum
  const browserProvider =
    provider || new ethers.BrowserProvider((window as any).ethereum);

  // Request account access if needed
  await browserProvider.send("eth_requestAccounts", []);

  // Get signer
  const signer = await browserProvider.getSigner();

  return {
    hubUrl,
    signer,
    httpClient: new FetchHttpClient(),
    wsFactory: new BrowserWebSocketFactory(),
    uuidGenerator: new BrowserUUIDGenerator(),
    // proxyUrl
  };
}

// Helper to create validator config from existing signer (for custom wallet integrations)
export function createValidatorFromSigner(
  hubUrl: string,
  signer: ethers.Signer
): ValidatorConfig {
  return {
    hubUrl,
    signer,
    httpClient: new FetchHttpClient(),
    wsFactory: new BrowserWebSocketFactory(),
    uuidGenerator: new BrowserUUIDGenerator(),
  };
}
