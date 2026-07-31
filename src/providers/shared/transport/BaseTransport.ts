import { TransportError } from '../errors/TransportError'
import { TransportMetrics } from '../metrics/TransportMetrics'
import { RetryPolicy } from '../retry/RetryPolicy'
import { TimeoutPolicy } from '../timeout/TimeoutPolicy'
import { MiddlewarePipeline } from '../middleware/MiddlewarePipeline'
import type { TransportMiddleware } from '../middleware/TransportMiddleware'
import type { ITransport } from '../interfaces/ITransport'
import type { TransportOptions } from './TransportOptions'
import type { TransportRequest } from './TransportRequest'
import type { TransportResponse } from './TransportResponse'

export abstract class BaseTransport implements ITransport<TransportRequest, TransportResponse> {
  protected initialized = false
  protected options: TransportOptions
  protected retryPolicy: RetryPolicy
  protected timeoutPolicy: TimeoutPolicy
  protected metrics: TransportMetrics
  protected middlewarePipeline: MiddlewarePipeline

  constructor(options: TransportOptions = {}) {
    this.options = options
    this.retryPolicy = new RetryPolicy(options.maxRetries ?? 0)
    this.timeoutPolicy = new TimeoutPolicy(options.timeout ?? 0)
    this.metrics = new TransportMetrics()
    this.middlewarePipeline = new MiddlewarePipeline()
  }

  async initialize(): Promise<void> {
    this.initialized = true
    this.metrics.reset()
  }

  async prepare(): Promise<void> {
    if (!this.initialized) {
      throw new TransportError('Transport must be initialized before prepare')
    }

    this.timeoutPolicy.activate()
  }

  async send(request: TransportRequest): Promise<TransportResponse> {
    if (!this.initialized) {
      throw new TransportError('Transport must be initialized before send')
    }

    const preparedRequest = await this.middlewarePipeline.executeBefore(request)
    const startTime = Date.now()

    try {
      const response = await this.simulateSend(preparedRequest)
      response.latency = Date.now() - startTime
      await this.middlewarePipeline.executeAfter(preparedRequest, response)
      this.metrics.recordRequest(response.latency)
      return response
    } catch (error) {
      await this.middlewarePipeline.executeError(preparedRequest, error as Error)
      this.metrics.recordFailure()
      throw error
    }
  }

  async shutdown(): Promise<void> {
    this.initialized = false
    this.timeoutPolicy.deactivate()
  }

  registerMiddleware(middleware: TransportMiddleware): void {
    this.middlewarePipeline.register(middleware)
  }

  removeMiddleware(middleware: TransportMiddleware): void {
    this.middlewarePipeline.remove(middleware)
  }

  protected async simulateSend(request: TransportRequest): Promise<TransportResponse> {
    if (this.timeoutPolicy.expired()) {
      throw new TransportError('Request timed out during transport simulation')
    }

    return {
      status: 'success',
      provider: request.provider,
      model: request.model,
      headers: request.headers ?? {},
      body: {
        message: `Simulated transport response for ${request.endpoint}`,
        requestId: request.id,
      },
      latency: 0,
      metadata: {
        simulated: true,
        endpoint: request.endpoint,
      },
    }
  }
}
