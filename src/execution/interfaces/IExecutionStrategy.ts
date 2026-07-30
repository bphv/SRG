export interface IExecutionStrategy {
  execute(...args: unknown[]): Promise<unknown>
}
