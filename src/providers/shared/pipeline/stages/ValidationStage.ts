import type { IPipelineStage } from '../interfaces/IPipelineStage'
import type { PipelineContext, PipelineError } from '../context/PipelineContext'

export class ValidationStage implements IPipelineStage {
  readonly name = 'ValidationStage'

  async process(context: PipelineContext): Promise<PipelineContext> {
    const errors: PipelineError[] = []
    const request = context.request

    if (!request.id || request.id.trim() === '') {
      errors.push({ code: 'missing_request_id', message: 'The request id is required.' })
    }

    if (!request.input && !request.prompt) {
      errors.push({ code: 'missing_payload', message: 'The request payload must include input or prompt.' })
    }

    if (!request.metadata?.defaultModel && !(request.modelHints && typeof request.modelHints.model === 'string')) {
      errors.push({ code: 'missing_model', message: 'A model must be provided via metadata.defaultModel or modelHints.model.' })
    }

    if (errors.length > 0) {
      return {
        ...context,
        errors: [...(context.errors ?? []), ...errors],
      }
    }

    return context
  }
}
