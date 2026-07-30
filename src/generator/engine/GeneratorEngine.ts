import { Component } from '#/core/component/Component'
import type { ComponentMetadata } from '#/core/component/ComponentMetadata'
import type { GeneratorEngineOptions } from './GeneratorEngineOptions'
import type { GeneratorEngineState } from './GeneratorEngineState'
import type { GeneratorEngineContext } from './GeneratorEngineContext'
import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { IGeneratorEngine } from '#/generator/interfaces/IGeneratorEngine'

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

  async generate(_request: GenerationRequest): Promise<void> {
    // stub
  }

  async prepare(_request: GenerationRequest): Promise<void> {
    // stub
  }

  async buildContext(_request: GenerationRequest): Promise<void> {
    // stub
  }

  async buildRequest(_request: GenerationRequest): Promise<void> {
    // stub
  }

  async buildPipeline(_request: GenerationRequest): Promise<void> {
    // stub
  }

  async finalize(_request: GenerationRequest): Promise<void> {
    // stub
  }
}
