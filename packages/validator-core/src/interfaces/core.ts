// Core interfaces for the validator system
export interface HttpClient {
  get<T = any>(url: string): Promise<{ data: T; status: number }>;
  post<T = any>(url: string, data?: any): Promise<{ data: T; status: number }>;
}

export interface WebSocketClient {
  send(data: string): void;
  close(): void;
  readyState: number;
  onopen: ((event: any) => void) | null;
  onmessage: ((event: any) => void) | null;
  onclose: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
}

export interface WebSocketFactory {
  create(url: string): WebSocketClient;
  OPEN: number;
  CONNECTING: number;
}

export interface UUIDGenerator {
  generate(): string;
}

export interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export interface EventEmitter {
  emit(event: string, ...args: any[]): void;
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
}
