export interface IGenerationStrategy {
  execute: (...args: unknown[]) => Promise<unknown>
}
