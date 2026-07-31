import type { TraceContext } from '../tracing/TraceContext'
import type { TraceSpan } from '../tracing/TraceSpan'

export interface ITracer {
  startTrace: (requestId?: string) => TraceContext
  finishTrace: () => void
  createSpan: (parentSpanId?: string) => TraceSpan
  finishSpan: (spanId: string, status?: string) => void
  currentTrace: () => TraceContext | undefined
}
