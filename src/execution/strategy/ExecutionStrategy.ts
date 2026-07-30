import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'
import type { ExecutionContext } from '#/execution/context/ExecutionContext'

export interface ExecutionStrategy {
  execute(context: ExecutionContext, request: ExecutionRequest): Promise<ExecutionResponse>
}
