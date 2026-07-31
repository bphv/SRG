import type { TransportHeaders } from './TransportHeaders'

export interface TransportRequest {
  id: string
  provider: string
  model: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | string
  headers?: TransportHeaders
  body?: unknown
  metadata?: Record<string, unknown>
}
