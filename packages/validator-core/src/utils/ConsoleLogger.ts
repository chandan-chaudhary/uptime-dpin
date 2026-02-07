import { Logger } from "../interfaces/core";

/**
 * Simple console-based logger implementation
 */
export class ConsoleLogger implements Logger {
  info(message: string, ...args: any[]): void {
    console.log(`ℹ️ ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`⚠️ ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`❌ ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    console.debug(`🔍 ${message}`, ...args);
  }
}
