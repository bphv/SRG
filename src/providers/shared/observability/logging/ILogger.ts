import type { LogEntry } from './LogEntry'
import type { LogLevel } from './LogLevel'

export interface ILogger {
  trace: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => LogEntry
  debug: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => LogEntry
  info: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => LogEntry
  warn: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => LogEntry
  error: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => LogEntry
  fatal: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => LogEntry
  createEntry: (level: LogLevel, message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => LogEntry
}
