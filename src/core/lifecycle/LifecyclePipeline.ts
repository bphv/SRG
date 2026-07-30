import type { LifecycleResult } from './LifecycleResult'
import type { LifecycleHooksMap } from './LifecycleHooks'

/**
 * LifecyclePipeline: orchestrates lifecycle method execution.
 * Implementations are stubs; pipeline is typed for future extension.
 */
export class LifecyclePipeline {
  private readonly hooks: LifecycleHooksMap = {}

  registerHook(name: string, fn: () => Promise<void> | void): void {
    this.hooks[name] = this.hooks[name] ?? []
    this.hooks[name].push(fn)
  }

  async runHook(name: string): Promise<void> {
    const handlers = this.hooks[name] ?? []
    for (const h of handlers) {
      // eslint-disable-next-line no-await-in-loop
      await h()
    }
  }

  async execute(): Promise<LifecycleResult> {
    // stub: no-op pipeline
    return { success: true }
  }
}
