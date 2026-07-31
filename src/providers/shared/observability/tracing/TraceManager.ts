import type { TraceContext } from './TraceContext'
import { TraceSpan } from './TraceSpan'

export class TraceManager {
  private currentTraceContext?: TraceContext
  private spans: Record<string, TraceSpan> = {}

  startTrace(requestId?: string): TraceContext {
    const context: TraceContext = {
      traceId: `trace-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
      spanId: `span-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
      requestId,
      timestamp: new Date().toISOString(),
    }

    this.currentTraceContext = context
    this.spans[context.spanId] = new TraceSpan(context)
    this.spans[context.spanId].start()

    return context
  }

  finishTrace(): void {
    if (!this.currentTraceContext) {
      return
    }

    const span = this.spans[this.currentTraceContext.spanId]
    span?.finish('OK')
    this.currentTraceContext = undefined
  }

  createSpan(parentSpanId?: string): TraceSpan {
    const context: TraceContext = {
      traceId: this.currentTraceContext?.traceId ?? `trace-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
      spanId: `span-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
      parentSpanId,
      requestId: this.currentTraceContext?.requestId,
      timestamp: new Date().toISOString(),
    }

    const span = new TraceSpan(context)
    span.start()
    this.spans[context.spanId] = span
    return span
  }

  finishSpan(spanId: string, status: string = 'OK'): void {
    const span = this.spans[spanId]
    if (span) {
      span.finish(status)
    }
  }

  currentTrace(): TraceContext | undefined {
    return this.currentTraceContext
  }
}
