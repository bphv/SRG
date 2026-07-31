import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'

export interface IExecutionEngine {
  execute(request: ExecutionRequest): Promise<ExecutionResponse>
  prepare(): Promise<void>
  selectProvider(): Promise<void>
  createSession(): Promise<void>
  buildExecutionRequest(): Promise<void>
  run(): Promise<void>
  finalize(): Promise<void>
}
