import type { ExecutionStage } from './ExecutionStage'
import type { ExecutionContext } from '#/execution/context/ExecutionContext'
import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'

export class ExecutionPipeline {
  private readonly stages: ExecutionStage[] = []

  addStage(stage: ExecutionStage): void {
    this.stages.push(stage)
  }

  async run(context: ExecutionContext, request: ExecutionRequest): Promise<ExecutionResponse> {
    let response: ExecutionResponse = { id: request.id, status: 'pending' }
    for (const stage of this.stages) {
      // eslint-disable-next-line no-await-in-loop
      response = await stage.run(context, request)
    }
    return response
  }
}
