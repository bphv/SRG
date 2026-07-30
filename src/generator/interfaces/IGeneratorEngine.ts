import type { GenerationRequest } from '#/generator/request/GenerationRequest'

export interface IGeneratorEngine {
  generate(request: GenerationRequest): Promise<void>
  prepare(request: GenerationRequest): Promise<void>
  buildContext(request: GenerationRequest): Promise<void>
  buildRequest(request: GenerationRequest): Promise<void>
  buildPipeline(request: GenerationRequest): Promise<void>
  finalize(request: GenerationRequest): Promise<void>
}
