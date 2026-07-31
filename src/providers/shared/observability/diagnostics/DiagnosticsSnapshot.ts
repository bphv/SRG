import type { HealthSnapshot } from '../health/HealthSnapshot'

export interface DiagnosticsSnapshot {
  timestamp: string
  health: HealthSnapshot[]
  metrics: Record<string, unknown>
  warnings: string[]
  errors: string[]
}
