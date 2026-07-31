import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'

export interface IExecutionProvider {
  id: string
  name: string
  capabilities: Record<string, boolean>
  execute: (request: ExecutionRequest) => Promise<ExecutionResponse>
}
