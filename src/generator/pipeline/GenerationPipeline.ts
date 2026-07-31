import type { PipelineStage } from './PipelineStage'
import type { GenerationContext } from '#/generator/context/GenerationContext'
import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'

/**
 * GenerationPipeline: orchestrates a sequence of PipelineStages (stubs).
 */
export class GenerationPipeline {
  private readonly stages: PipelineStage[] = []

  addStage(stage: PipelineStage): void {
    this.stages.push(stage)
  }

  async run(context: GenerationContext, request: GenerationRequest): Promise<GenerationResponse> {
    let response: GenerationResponse = { id: request.id, status: 'pending' }
    for (const stage of this.stages) {
      // stub: execute stages sequentially
       
      response = await stage.run(context, request)
    }
    return response
  }
}
