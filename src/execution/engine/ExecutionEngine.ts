import { Component } from '#/core/component/Component'
import type { ComponentMetadata } from '#/core/component/ComponentMetadata'
import type { ExecutionEngineOptions } from './ExecutionEngineOptions'
import type { ExecutionEngineState } from './ExecutionEngineState'
import type { ExecutionEngineContext } from './ExecutionEngineContext'
import type { IExecutionEngine } from '#/execution/interfaces/IExecutionEngine'
import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'
import type { ProviderRegistry } from '#/providers/registry/ProviderRegistry'
import { ProviderResolver } from '#/providers/resolver/ProviderResolver'

/**
 * ExecutionEngine: responsable de l'exécution réelle des ExecutionRequest.
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

  async execute(executionRequest: ExecutionRequest): Promise<ExecutionResponse> {
    const providerRegistry = this.context.providerRegistry as ProviderRegistry | undefined
    if (!providerRegistry) {
      return {
        id: executionRequest.id,
        status: 'failed',
        errors: ['provider_registry_unavailable'],
      }
    }

    const providers = providerRegistry.findByCapability('completion')
    if (providers.length === 0) {
      return {
        id: executionRequest.id,
        status: 'failed',
        errors: ['no_provider_available'],
      }
    }

    const resolver = new ProviderResolver()
    const provider = resolver.resolveBest(providers, 'completion')
    if (!provider) {
      return {
        id: executionRequest.id,
        status: 'failed',
        errors: ['provider_resolution_failed'],
      }
    }

    await provider.initialize()

    const executionResponse = (await provider.execute(executionRequest)) as ExecutionResponse

    await provider.shutdown()

    return executionResponse
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
