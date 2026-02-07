// // Node.js adapters for platform-agnostic validator
// import axios from "axios";
// import WebSocket from "ws";
// import { randomUUID } from "crypto";
// import { ethers } from "ethers";
// import {
//   HttpClient,
//   WebSocketClient,
//   WebSocketFactory,
//   UUIDGenerator,
//   ValidatorConfig,
// } from "./validator";

// // Axios HTTP client adapter
// export class AxiosHttpClient implements HttpClient {
//   async get<T = any>(url: string): Promise<{ data: T; status: number }> {
//     const response = await axios.get<T>(url, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//         Accept:
//           "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
//         "Accept-Language": "en-US,en;q=0.9",
//         "Accept-Encoding": "gzip, deflate, br",
//         Connection: "keep-alive",
//         "Cache-Control": "max-age=0",
//       },
//       validateStatus: () => true, // Accept any status code
//       timeout: 10000, // 10 second timeout
//       maxRedirects: 0, // Don't follow redirects - capture 301/302
//     });
//     return { data: response.data, status: response.status };
//   }

//   async post<T = any>(
//     url: string,
//     data?: any
//   ): Promise<{ data: T; status: number }> {
//     const response = await axios.post<T>(url, data);
//     return { data: response.data, status: response.status };
//   }
// }

// // WebSocket adapter for Node.js 'ws' library
// class NodeWebSocketAdapter implements WebSocketClient {
//   private ws: WebSocket;

//   constructor(url: string) {
//     this.ws = new WebSocket(url);
//   }

//   get readyState(): number {
//     return this.ws.readyState;
//   }

//   get onopen() {
//     return this.ws.onopen;
//   }
//   set onopen(handler: ((event: any) => void) | null) {
//     this.ws.onopen = handler as any;
//   }

//   get onmessage() {
//     return this.ws.onmessage;
//   }
//   set onmessage(handler: ((event: any) => void) | null) {
//     this.ws.onmessage = handler as any;
//   }

//   get onclose() {
//     return this.ws.onclose;
//   }
//   set onclose(handler: ((event: any) => void) | null) {
//     this.ws.onclose = handler as any;
//   }

//   get onerror() {
//     return this.ws.onerror;
//   }
//   set onerror(handler: ((event: any) => void) | null) {
//     this.ws.onerror = handler as any;
//   }

//   send(data: string): void {
//     this.ws.send(data);
//   }

//   close(): void {
//     this.ws.close();
//   }
// }

// export class NodeWebSocketFactory implements WebSocketFactory {
//   readonly OPEN = WebSocket.OPEN;
//   readonly CONNECTING = WebSocket.CONNECTING;

//   create(url: string): WebSocketClient {
//     return new NodeWebSocketAdapter(url);
//   }
// }

// // Node.js UUID generator
// export class NodeUUIDGenerator implements UUIDGenerator {
//   generate(): string {
//     return randomUUID();
//   }
// }

// // Helper to create validator config from private key (for CLI backward compatibility)
// export function createValidatorFromPrivateKey(
//   hubUrl: string,
//   privateKey: string
// ): ValidatorConfig {
//   const signer = new ethers.Wallet(privateKey);

//   return {
//     hubUrl,
//     signer,
//     httpClient: new AxiosHttpClient(),
//     wsFactory: new NodeWebSocketFactory(),
//     uuidGenerator: new NodeUUIDGenerator(),
//   };
// }

// // Helper to create validator config from signer (for advanced Node.js usage)
// export function createValidatorFromSigner(
//   hubUrl: string,
//   signer: ethers.Signer
// ): ValidatorConfig {
//   return {
//     hubUrl,
//     signer,
//     httpClient: new AxiosHttpClient(),
//     wsFactory: new NodeWebSocketFactory(),
//     uuidGenerator: new NodeUUIDGenerator(),
//   };
// }
