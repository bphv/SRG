import type { HealthSnapshot } from '../health/HealthSnapshot'

export interface IHealthMonitor {
  register: (component: string, initialStatus?: string, metadata?: Record<string, unknown>) => void
  heartbeat: (component: string) => void
  update: (component: string, status: string, metadata?: Record<string, unknown>) => void
  snapshot: (component: string) => HealthSnapshot | undefined
  remove: (component: string) => void
}
