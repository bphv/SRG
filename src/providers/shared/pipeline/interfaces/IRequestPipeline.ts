import type { PipelineResult } from '../engine/PipelineResult'
import type { IPipelineStage } from './IPipelineStage'
import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'

export interface IRequestPipeline {
  registerStage(stage: IPipelineStage): void
  removeStage(stage: IPipelineStage): void
  execute(request: ExecutionRequest, provider?: string, configuration?: Record<string, unknown>, options?: Record<string, unknown>): Promise<PipelineResult>
  clear(): void
  getStages(): IPipelineStage[]
}
