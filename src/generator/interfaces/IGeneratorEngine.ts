import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'

export interface IGeneratorEngine {
  generate(request: GenerationRequest): Promise<GenerationResponse>
  validateRequest(request: GenerationRequest): Promise<void>
  prepare(request: GenerationRequest): Promise<void>
  buildContext(request: GenerationRequest): Promise<void>
  buildExecutionRequest(request: GenerationRequest): Promise<import('#/execution/request/ExecutionRequest').ExecutionRequest>
  buildGenerationResponse(response: import('#/execution/response/ExecutionResponse').ExecutionResponse): Promise<GenerationResponse>
  finalize(request: GenerationRequest, response: GenerationResponse): Promise<GenerationResponse>
}
