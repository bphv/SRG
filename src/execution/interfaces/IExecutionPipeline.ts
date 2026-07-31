export interface IExecutionPipeline {
  addStage: (stage: unknown) => void
  run: (...args: unknown[]) => Promise<unknown>
}
