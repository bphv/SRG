import type { TransportRequest } from '../transport/TransportRequest'
import type { TransportResponse } from '../transport/TransportResponse'

export interface TransportMiddleware {
  beforeSend?: (request: TransportRequest) => Promise<TransportRequest> | TransportRequest
  afterReceive?: (request: TransportRequest, response: TransportResponse) => Promise<TransportResponse> | TransportResponse
  onError?: (request: TransportRequest, error: Error) => Promise<void> | void
}
