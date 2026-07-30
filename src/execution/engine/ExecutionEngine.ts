import { Component } from '#/core/component/Component'
import type { ComponentMetadata } from '#/core/component/ComponentMetadata'
import type { ExecutionEngineOptions } from './ExecutionEngineOptions'
import type { ExecutionEngineState } from './ExecutionEngineState'
import type { ExecutionEngineContext } from './ExecutionEngineContext'
import type { IExecutionEngine } from '#/execution/interfaces/IExecutionEngine'
import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'

/**
 * ExecutionEngine: responsable de l'exécution réelle des GenerationRequest.
 * Hérite de Component et implémente IExecutionEngine. Méthodes stubs.
 */
export class ExecutionEngine extends Component implements IExecutionEngine {
  readonly options: ExecutionEngineOptions
  state: ExecutionEngineState
  context: ExecutionEngineContext

  constructor(metadata: ComponentMetadata, options: ExecutionEngineOptions = {}, context: ExecutionEngineContext = {}) {
    super(metadata, {}, context)
    this.options = options
    this.state = { id: metadata.id, status: 'created' }
    this.context = context
  }

  async execute(_generationRequest: GenerationRequest): Promise<GenerationResponse> {
    // stub: transform GenerationRequest -> ExecutionRequest, select provider, run pipeline, return GenerationResponse
    return { id: _generationRequest.id, status: 'failed', errors: ['not_implemented'] }
  }

  async prepare(): Promise<void> {
    // stub
  }

  async selectProvider(): Promise<void> {
    // stub
  }

  async createSession(): Promise<void> {
    // stub
  }

  async buildExecutionRequest(): Promise<void> {
    // stub
  }

  async run(): Promise<void> {
    // stub
  }

  async finalize(): Promise<void> {
    // stub
  }
}
