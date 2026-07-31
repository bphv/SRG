import type { PipelineContext } from '../context/PipelineContext'

export interface IPipelineStage {
  name: string
  process: (context: PipelineContext) => Promise<PipelineContext>
}
