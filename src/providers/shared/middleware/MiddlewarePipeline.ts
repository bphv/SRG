import type { TransportRequest } from '../transport/TransportRequest'
import type { TransportResponse } from '../transport/TransportResponse'
import type { TransportMiddleware } from './TransportMiddleware'

export class MiddlewarePipeline {
  private middlewares: TransportMiddleware[] = []

  register(middleware: TransportMiddleware): void {
    if (!this.middlewares.includes(middleware)) {
      this.middlewares.push(middleware)
    }
  }

  remove(middleware: TransportMiddleware): void {
    this.middlewares = this.middlewares.filter((item) => item !== middleware)
  }

  async executeBefore(request: TransportRequest): Promise<TransportRequest> {
    let current = request

    for (const middleware of this.middlewares) {
      if (middleware.beforeSend) {
        current = await middleware.beforeSend(current)
      }
    }

    return current
  }

  async executeAfter(request: TransportRequest, response: TransportResponse): Promise<TransportResponse> {
    let current = response

    for (const middleware of this.middlewares) {
      if (middleware.afterReceive) {
        current = await middleware.afterReceive(request, current)
      }
    }

    return current
  }

  async executeError(request: TransportRequest, error: Error): Promise<void> {
    for (const middleware of this.middlewares) {
      if (middleware.onError) {
        await middleware.onError(request, error)
      }
    }
  }
}
