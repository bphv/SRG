import type { IPipelineStage } from '../interfaces/IPipelineStage'
import type { PipelineContext } from '../context/PipelineContext'

export class OptionsMergeStage implements IPipelineStage {
  readonly name = 'OptionsMergeStage'

  async process(context: PipelineContext): Promise<PipelineContext> {
    const requestOptions = context.request.options ?? {}
    const providerOptions = context.configuration?.providerOptions ?? {}
    const defaultOptions = context.configuration?.defaultOptions ?? {}

    const mergedOptions = {
      ...defaultOptions,
      ...providerOptions,
      ...requestOptions,
    }

    return {
      ...context,
      request: {
        ...context.request,
        options: mergedOptions,
      },
      metadata: {
        ...context.metadata,
        mergedOptions,
      },
    }
  }
}
