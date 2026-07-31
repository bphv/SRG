import { HealthStatus } from './HealthStatus'
import type { HealthSnapshot } from './HealthSnapshot'
import type { IHealthMonitor } from '../interfaces/IHealthMonitor'

interface HealthEntry {
  status: HealthStatus
  registeredAt: number
  lastHeartbeat: number
  metadata?: Record<string, unknown>
}

export class HealthMonitor implements IHealthMonitor {
  private entries: Record<string, HealthEntry> = {}

  register(component: string, initialStatus: string = HealthStatus.UNKNOWN, metadata: Record<string, unknown> = {}): void {
    this.entries[component] = {
      status: initialStatus as HealthStatus,
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
      metadata,
    }
  }

  heartbeat(component: string): void {
    const entry = this.entries[component]
    if (!entry) {
      return
    }

    entry.lastHeartbeat = Date.now()
  }

  update(component: string, status: string, metadata: Record<string, unknown> = {}): void {
    const entry = this.entries[component]
    if (!entry) {
      this.register(component, status, metadata)
      return
    }

    entry.status = status as HealthStatus
    entry.metadata = {
      ...entry.metadata,
      ...metadata,
    }
  }

  snapshot(component: string): HealthSnapshot | undefined {
    const entry = this.entries[component]
    if (!entry) {
      return undefined
    }

    return {
      component,
      status: entry.status,
      uptime: Date.now() - entry.registeredAt,
      lastHeartbeat: new Date(entry.lastHeartbeat).toISOString(),
      metadata: entry.metadata,
    }
  }

  remove(component: string): void {
    delete this.entries[component]
  }
}
