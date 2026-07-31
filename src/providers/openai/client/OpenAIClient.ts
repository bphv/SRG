import OpenAI from 'openai'
import type { OpenAIClientOptions } from '#/providers/openai/client/OpenAIClientOptions'
import type { OpenAIClientResponse } from '#/providers/openai/client/OpenAIClientResponse'
import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import { OpenAIClientError, ConfigurationError, NetworkError, TimeoutError, AuthenticationError, RateLimitError } from '#/providers/openai/client/OpenAIClientError'
import { OpenAIMapper } from '#/providers/openai/OpenAIMapper'
import { OpenAITransport } from '#/providers/openai/client/OpenAITransport'
import { RequestPipeline } from '#/providers/shared/pipeline/engine/RequestPipeline'
import { ValidationStage } from '#/providers/shared/pipeline/stages/ValidationStage'
import { ModelSelectionStage } from '#/providers/shared/pipeline/stages/ModelSelectionStage'
import { OptionsMergeStage } from '#/providers/shared/pipeline/stages/OptionsMergeStage'
import { MetadataStage } from '#/providers/shared/pipeline/stages/MetadataStage'
import { LoggerFactory } from '#/providers/shared/observability/logging/LoggerFactory'
import { TraceManager } from '#/providers/shared/observability/tracing/TraceManager'
import { RuntimeMetrics } from '#/providers/shared/observability/metrics/RuntimeMetrics'
import { HealthMonitor } from '#/providers/shared/observability/health/HealthMonitor'
import { HealthStatus } from '#/providers/shared/observability/health/HealthStatus'

export class OpenAIClient {
  readonly options: OpenAIClientOptions
  private initialized = false
  private openAI: OpenAI | null = null
  private transport: OpenAITransport
  private pipeline = new RequestPipeline()
  private logger = new LoggerFactory().create('OpenAIClient')
  private tracer = new TraceManager()
  private metrics = new RuntimeMetrics()
  private healthMonitor = new HealthMonitor()
  private mapper = new OpenAIMapper()

  constructor(options: OpenAIClientOptions = {}) {
    this.options = options
    this.transport = new OpenAITransport(options, this.mapper)
    this.pipeline.registerStage(new ValidationStage())
    this.pipeline.registerStage(new ModelSelectionStage())
    this.pipeline.registerStage(new OptionsMergeStage())
    this.pipeline.registerStage(new MetadataStage())
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (!this.options.apiKey || this.options.apiKey.trim() === '') {
      throw new ConfigurationError('OpenAI apiKey is required')
    }

    this.openAI = new OpenAI({ apiKey: this.options.apiKey, baseURL: this.options.baseUrl })
    this.transport.setOpenAIClient(this.openAI)
    await this.transport.initialize()
    this.initialized = true
    this.healthMonitor.register('OpenAIClient', HealthStatus.STARTING, { apiKeyConfigured: true })
    this.logger.info('OpenAIClient initialized', { initialized: this.initialized }, { sdkVersion: this.options.sdkVersion })
  }

  async health(): Promise<OpenAIClientResponse> {
    const span = this.tracer.createSpan('health-check')
    this.logger.trace('Starting OpenAI health check', {}, { spanId: span.context.spanId })

    if (!this.initialized) {
      const response: OpenAIClientResponse = {
        status: 'failed',
        provider: 'openai',
        model: this.options.baseUrl ?? 'unknown',
        latency: 0,
      }
      this.healthMonitor.update('OpenAIClient', HealthStatus.FAILED, { reason: 'not_initialized' })
      span.finish('FAILED')
      return response
    }

    try {
      await this.transport.prepare()
      this.healthMonitor.update('OpenAIClient', HealthStatus.READY)
      this.logger.info('OpenAI client health is ready')
      span.finish('OK')
      return {
        status: 'success',
        provider: 'openai',
        model: this.options.baseUrl ?? 'openai',
        latency: 0,
      }
    } catch (error) {
      this.healthMonitor.update('OpenAIClient', HealthStatus.DEGRADED, { error: (error as Error).message })
      this.logger.error('OpenAI health check failed', {}, { error: (error as Error).message })
      span.finish('FAILED')
      return {
        status: 'failed',
        provider: 'openai',
        model: this.options.baseUrl ?? 'openai',
        latency: 0,
        metadata: { error: (error as Error).message },
      }
    }
  }

  async execute(request: ExecutionRequest): Promise<OpenAIClientResponse> {
    const span = this.tracer.createSpan('execute')
    this.logger.debug('OpenAIClient execute start', { requestId: request.id })
    const startTime = Date.now()

    if (!this.initialized) {
      throw new OpenAIClientError('OpenAI client is not initialized')
    }

    const pipelineResult = await this.pipeline.execute(
      request,
      'openai',
      {
        endpoint: this.options.baseUrl ?? '/v1/chat/completions',
        providerOptions: { timeout: this.options.timeout },
        defaultOptions: {},
      },
      {
        userAgent: `srg-openai-client/${this.options.sdkVersion ?? '1.0'}`,
      },
    )

    if (!pipelineResult.success || !pipelineResult.transportRequest) {
      const error = new OpenAIClientError('Pipeline validation failed')
      this.logger.error('OpenAI pipeline failed', { requestId: request.id }, { errors: pipelineResult.errors })
      span.finish('FAILED')
      this.metrics.recordRequest(0, false)
      throw error
    }

    try {
      const transportResponse = await this.transport.send(pipelineResult.transportRequest)
      const latency = Date.now() - startTime
      this.metrics.recordRequest(latency, true)
      this.logger.info('OpenAI request completed', { requestId: request.id }, { latency })
      span.finish('OK')

      return {
        status: 'success',
        provider: 'openai',
        model: transportResponse.model,
        content: transportResponse.body && typeof transportResponse.body === 'object' ? (transportResponse.body as any).text : undefined,
        usage: transportResponse.body && typeof transportResponse.body === 'object' ? (transportResponse.body as any).usage : undefined,
        latency: transportResponse.latency,
        metadata: transportResponse.metadata,
      }
    } catch (error) {
      const err = this.mapError(error as Error)
      const latency = Date.now() - startTime
      this.metrics.recordRequest(latency, false)
      this.logger.error('OpenAI execution failed', { requestId: request.id }, { error: err.message })
      span.finish('FAILED')
      throw err
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down OpenAI client')
    await this.transport.shutdown()
    this.initialized = false
    this.healthMonitor.update('OpenAIClient', HealthStatus.STOPPED)
  }

  private mapError(error: Error): Error {
    const message = error.message.toLowerCase()
    if (message.includes('authentication') || message.includes('invalid_api_key')) {
      return new AuthenticationError(error.message)
    }
    if (message.includes('rate limit')) {
      return new RateLimitError(error.message)
    }
    if (message.includes('timeout')) {
      return new TimeoutError(error.message)
    }
    if (message.includes('network')) {
      return new NetworkError(error.message)
    }
    return new OpenAIClientError(error.message)
  }
}
