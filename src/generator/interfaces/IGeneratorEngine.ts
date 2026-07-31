import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'
import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'

export interface IGeneratorEngine {
  generate: (request: GenerationRequest) => Promise<GenerationResponse>
  validateRequest: (request: GenerationRequest) => Promise<void>
  prepare: (request: GenerationRequest) => Promise<void>
  buildContext: (request: GenerationRequest) => Promise<void>
  buildExecutionRequest: (request: GenerationRequest) => Promise<ExecutionRequest>
  buildGenerationResponse: (response: ExecutionResponse) => Promise<GenerationResponse>
  finalize: (request: GenerationRequest, response: GenerationResponse) => Promise<GenerationResponse>
}
