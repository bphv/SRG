import type { LogLevel } from './LogLevel'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  component: string
  context?: Record<string, unknown>
  metadata?: Record<string, unknown>
}
