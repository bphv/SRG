import { Component } from '#/core/component/Component'
import type { ComponentMetadata } from '#/core/component/ComponentMetadata'
import type { PromptEngineOptions } from './PromptEngineOptions'
import type { PromptEngineState } from './PromptEngineState'
import type { PromptEngineContext } from './PromptEngineContext'
import type { IPromptEngine } from '#/prompt/interfaces/IPromptEngine'

/**
 * PromptEngine: orchestrates prompt lifecycle (stub).
 * Inherits from the SRG `Component` model and implements `IPromptEngine`.
 */
export class PromptEngine extends Component implements IPromptEngine {
  readonly options: PromptEngineOptions
  state: PromptEngineState
  context: PromptEngineContext

  constructor(metadata: ComponentMetadata, options: PromptEngineOptions = {}, context: PromptEngineContext = {}) {
    super(metadata, {}, context)
    this.options = options
    this.state = { id: metadata.id, status: 'created' }
    this.context = context
  }

  async registerTemplate(): Promise<void> {
    // stub
  }

  async loadTemplate(): Promise<void> {
    // stub
  }

  async build(): Promise<void> {
    // stub
  }

  async render(): Promise<string> {
    return ''
  }
}
