import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'
import type { GenerationContext } from '#/generator/context/GenerationContext'

/**
 * PipelineStage: a single stage in the generation pipeline.
 */
export interface PipelineStage {
  name: string
  run(context: GenerationContext, request: GenerationRequest): Promise<GenerationResponse>
}
