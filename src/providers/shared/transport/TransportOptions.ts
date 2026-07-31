import type { TransportHeaders } from './TransportHeaders'

export interface TransportOptions {
  timeout?: number
  maxRetries?: number
  baseUrl?: string
  keepAlive?: boolean
  compression?: 'gzip' | 'deflate' | 'br' | 'none' | string
  userAgent?: string
  headers?: TransportHeaders
}
