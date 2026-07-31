export interface TraceContext {
  traceId: string
  spanId: string
  parentSpanId?: string
  requestId?: string
  timestamp: string
}
