import { Component } from '#/core/component/Component'
import type { ComponentMetadata } from '#/core/component/ComponentMetadata'
import type { GeneratorEngineOptions } from './GeneratorEngineOptions'
import type { GeneratorEngineState } from './GeneratorEngineState'
import type { GeneratorEngineContext } from './GeneratorEngineContext'
import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'
import type { IGeneratorEngine } from '#/generator/interfaces/IGeneratorEngine'
import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'
import type { IExecutionEngine } from '#/execution/interfaces/IExecutionEngine'

/**
 * GeneratorEngine: orchestrateur de génération (stubs only).
 * Hérite de `Component` et implémente `IGeneratorEngine`.
 */
export class GeneratorEngine extends Component implements IGeneratorEngine {
  readonly options: GeneratorEngineOptions
  state: GeneratorEngineState
  context: GeneratorEngineContext

  constructor(metadata: ComponentMetadata, options: GeneratorEngineOptions = {}, context: GeneratorEngineContext = {}) {
    super(metadata, {}, context)
    this.options = options
    this.state = { id: metadata.id, status: 'created' }
    this.context = context
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    await this.validateRequest(request)
    await this.prepare(request)
    await this.buildContext(request)

    const executionRequest = await this.buildExecutionRequest(request)
    const executionEngine = this.context.executionEngine as IExecutionEngine | undefined

    if (!executionEngine) {
      return {
        id: request.id,
        status: 'failed',
        errors: ['execution_engine_unavailable'],
      }
    }

    const executionResponse = await executionEngine.execute(executionRequest)
    const generationResponse = await this.buildGenerationResponse(executionResponse)
    return this.finalize(request, generationResponse)
  }

  async validateRequest(request: GenerationRequest): Promise<void> {
    // stub validation logic
    if (!request.id) {
      throw new Error('GenerationRequest must include id')
    }
  }

  async prepare(_request: GenerationRequest): Promise<void> {
    // stub
  }

  async buildContext(_request: GenerationRequest): Promise<void> {
    // stub
  }

  async buildExecutionRequest(request: GenerationRequest): Promise<ExecutionRequest> {
    return {
      id: request.id,
      generationId: request.id,
      input: request.promptId ?? request.task,
      metadata: request.metadata,
    }
  }

  async buildGenerationResponse(response: ExecutionResponse): Promise<GenerationResponse> {
    return {
      id: response.id,
      status: response.status === 'running' ? 'pending' : response.status,
      content: response.output,
      artifacts: response.artifacts,
      warnings: response.status === 'failed' ? response.errors : undefined,
      metrics: response.metrics,
      metadata: response.metadata,
    }
  }

  async finalize(_request: GenerationRequest, response: GenerationResponse): Promise<GenerationResponse> {
    return response
  }
}
