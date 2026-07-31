import type { DiagnosticsSnapshot } from './DiagnosticsSnapshot'
import type { HealthMonitor } from '../health/HealthMonitor'
import type { RuntimeMetrics } from '../metrics/RuntimeMetrics'

export class Diagnostics {
  constructor(private readonly healthMonitor: HealthMonitor, private readonly runtimeMetrics: RuntimeMetrics) {}

  snapshot(): DiagnosticsSnapshot {
    const healthEntries = Object.keys((this.healthMonitor as any).entries ?? {}).map((component) => {
      const snapshot = this.healthMonitor.snapshot(component)
      return snapshot ? snapshot : undefined
    }).filter((snapshot): snapshot is NonNullable<typeof snapshot> => snapshot !== undefined)

    return {
      timestamp: new Date().toISOString(),
      health: healthEntries,
      metrics: this.runtimeMetrics.snapshot(),
      warnings: [],
      errors: [],
    }
  }
}
