import type { TransportHeaders } from './TransportHeaders'

export interface TransportResponse {
  status: 'success' | 'error' | 'pending'
  provider: string
  model: string
  headers: TransportHeaders
  body?: unknown
  latency: number
  metadata?: Record<string, unknown>
}
