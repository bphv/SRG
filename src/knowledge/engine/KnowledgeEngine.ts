import type { ComponentMetadata } from '#/core/component/ComponentMetadata'
import type { KnowledgeEngineOptions } from './KnowledgeEngineOptions'
import type { KnowledgeEngineContext } from './KnowledgeEngineContext'
import type { KnowledgeEngineState } from './KnowledgeEngineState'
import type { IKnowledgeEngine } from '#/knowledge/interfaces/IKnowledgeEngine'

/**
 * KnowledgeEngine: Document management engine (stub).
 * Inherits the Component model in future implementations.
 */
export class KnowledgeEngine implements IKnowledgeEngine {
  readonly metadata: ComponentMetadata
  readonly options: KnowledgeEngineOptions
  state: KnowledgeEngineState
  context?: KnowledgeEngineContext

  constructor(metadata: ComponentMetadata, options: KnowledgeEngineOptions = {}) {
    this.metadata = metadata
    this.options = options
    this.state = { id: metadata.id, status: 'created' }
  }

  async discover(): Promise<void> {
    // stub
  }

  async index(): Promise<void> {
    // stub
  }

  async search(_query?: unknown): Promise<unknown[]> {
    return []
  }
}
