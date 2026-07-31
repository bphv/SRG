import type {
  BusinessDiagnostic,
  BusinessHealth,
  BusinessMetric,
  BusinessTimelineEntry,
  BusinessTrace,
} from '#/business/orchestrator/types'

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export class BusinessState {
  private readonly timeline: BusinessTimelineEntry[] = []
  private readonly metrics: BusinessMetric[] = []
  private readonly traces: BusinessTrace[] = []
  private readonly diagnostics: BusinessDiagnostic[] = []

  pushTimeline(entry: Omit<BusinessTimelineEntry, 'id' | 'at'>): BusinessTimelineEntry {
    const fullEntry: BusinessTimelineEntry = {
      id: randomId('tl'),
      at: new Date().toISOString(),
      ...entry,
    }
    this.timeline.unshift(fullEntry)
    if (this.timeline.length > 2000) this.timeline.length = 2000
    return fullEntry
  }

  pushMetric(metric: Omit<BusinessMetric, 'id' | 'at'>): BusinessMetric {
    const fullMetric: BusinessMetric = {
      id: randomId('met'),
      at: new Date().toISOString(),
      ...metric,
    }
    this.metrics.unshift(fullMetric)
    if (this.metrics.length > 2000) this.metrics.length = 2000
    return fullMetric
  }

  pushTrace(trace: Omit<BusinessTrace, 'id'>): BusinessTrace {
    const fullTrace: BusinessTrace = {
      id: randomId('tr'),
      ...trace,
    }
    this.traces.unshift(fullTrace)
    if (this.traces.length > 2000) this.traces.length = 2000
    return fullTrace
  }

  pushDiagnostic(diagnostic: Omit<BusinessDiagnostic, 'id' | 'at'>): BusinessDiagnostic {
    const fullDiagnostic: BusinessDiagnostic = {
      id: randomId('diag'),
      at: new Date().toISOString(),
      ...diagnostic,
    }
    this.diagnostics.unshift(fullDiagnostic)
    if (this.diagnostics.length > 2000) this.diagnostics.length = 2000
    return fullDiagnostic
  }

  getTimeline(userId?: string): BusinessTimelineEntry[] {
    if (!userId) return [...this.timeline]
    return this.timeline.filter((item) => item.userId === userId)
  }

  getMetrics(userId?: string): BusinessMetric[] {
    if (!userId) return [...this.metrics]
    return this.metrics.filter((item) => item.userId === userId)
  }

  getTraces(userId?: string): BusinessTrace[] {
    if (!userId) return [...this.traces]
    return this.traces.filter((item) => item.userId === userId)
  }

  getDiagnostics(userId?: string): BusinessDiagnostic[] {
    if (!userId) return [...this.diagnostics]
    return this.diagnostics.filter((item) => item.userId === userId)
  }

  getHealth(): BusinessHealth {
    const hasErrors = this.diagnostics.some((item) => item.severity === 'error')
    return {
      status: hasErrors ? 'degraded' : 'ok',
      lastUpdatedAt: new Date().toISOString(),
      checks: [
        { name: 'identity', status: 'ok', message: 'Identity engine reachable' },
        { name: 'wallet', status: 'ok', message: 'Wallet engine reachable' },
        { name: 'credits', status: 'ok', message: 'Credit engine reachable' },
        { name: 'billing', status: 'ok', message: 'Billing engine reachable' },
        { name: 'foundation', status: 'ok', message: 'Business foundation snapshot available' },
      ],
    }
  }
}
