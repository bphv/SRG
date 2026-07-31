import type { HealthStatus } from './HealthStatus'

export interface HealthSnapshot {
  component: string
  status: HealthStatus
  uptime: number
  lastHeartbeat: string
  metadata?: Record<string, unknown>
}
