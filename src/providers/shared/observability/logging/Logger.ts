import { LogLevel } from './LogLevel'
import type { LogEntry } from './LogEntry'
import type { ILogger } from './ILogger'

export class Logger implements ILogger {
  constructor(private readonly component: string) {}

  trace(message: string, context: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}): LogEntry {
    return this.createEntry(LogLevel.TRACE, message, context, metadata)
  }

  debug(message: string, context: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}): LogEntry {
    return this.createEntry(LogLevel.DEBUG, message, context, metadata)
  }

  info(message: string, context: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}): LogEntry {
    return this.createEntry(LogLevel.INFO, message, context, metadata)
  }

  warn(message: string, context: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}): LogEntry {
    return this.createEntry(LogLevel.WARN, message, context, metadata)
  }

  error(message: string, context: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}): LogEntry {
    return this.createEntry(LogLevel.ERROR, message, context, metadata)
  }

  fatal(message: string, context: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}): LogEntry {
    return this.createEntry(LogLevel.FATAL, message, context, metadata)
  }

  createEntry(level: LogLevel, message: string, context: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}): LogEntry {
    const entry: LogEntry = {
      id: `log-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      component: this.component,
      context,
      metadata,
    }

    return entry
  }
}
