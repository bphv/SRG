export type LoggerLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
  debug(message: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}

export class ConsoleLogger implements Logger {
  constructor(private readonly context: string) {}

  debug(message: string): void {
    console.debug(`[${this.context}] DEBUG: ${message}`)
  }

  info(message: string): void {
    console.info(`[${this.context}] INFO: ${message}`)
  }

  warn(message: string): void {
    console.warn(`[${this.context}] WARN: ${message}`)
  }

  error(message: string): void {
    console.error(`[${this.context}] ERROR: ${message}`)
  }
}
