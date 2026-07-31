import type { IPipelineStage } from '../interfaces/IPipelineStage'
import type { PipelineContext } from '../context/PipelineContext'

export class ModelSelectionStage implements IPipelineStage {
  readonly name = 'ModelSelectionStage'
  readonly defaultModel = 'gpt-4.1'

  async process(context: PipelineContext): Promise<PipelineContext> {
    const request = context.request
    const requestedModel =
      typeof request.metadata?.defaultModel === 'string' && request.metadata.defaultModel.trim() !== ''
        ? request.metadata.defaultModel
        : typeof request.modelHints?.model === 'string' && request.modelHints.model.trim() !== ''
        ? request.modelHints.model
        : undefined

    const selectedModel = requestedModel ?? this.defaultModel

    return {
      ...context,
      metadata: {
        ...context.metadata,
        selectedModel,
      },
    }
  }
}
