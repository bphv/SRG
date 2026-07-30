import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'

export interface IExecutionEngine {
  execute(request: GenerationRequest): Promise<GenerationResponse>
  prepare(): Promise<void>
  selectProvider(): Promise<void>
  createSession(): Promise<void>
  buildExecutionRequest(): Promise<void>
  run(): Promise<void>
  finalize(): Promise<void>
}
