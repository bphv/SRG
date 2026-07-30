import type { LifecycleResult } from './LifecycleResult'
import { LifecyclePipeline } from './LifecyclePipeline'
import type { LifecycleHooksMap } from './LifecycleHooks'

/**
 * LifecycleManager: manages lifecycle operations for SRG components.
 * Methods are stubs and contain no business logic.
 */
export class LifecycleManager {
  private readonly pipeline = new LifecyclePipeline()

  async initialize(): Promise<LifecycleResult> {
    await this.pipeline.runHook('beforeInitialize')
    const res = await this.pipeline.execute()
    await this.pipeline.runHook('afterInitialize')
    return res
  }

  async configure(): Promise<LifecycleResult> {
    return this.pipeline.execute()
  }

  async start(): Promise<LifecycleResult> {
    await this.pipeline.runHook('beforeStart')
    const res = await this.pipeline.execute()
    await this.pipeline.runHook('afterStart')
    return res
  }

  async pause(): Promise<LifecycleResult> {
    return this.pipeline.execute()
  }

  async resume(): Promise<LifecycleResult> {
    return this.pipeline.execute()
  }

  async reload(): Promise<LifecycleResult> {
    return this.pipeline.execute()
  }

  async stop(): Promise<LifecycleResult> {
    await this.pipeline.runHook('beforeStop')
    const res = await this.pipeline.execute()
    await this.pipeline.runHook('afterStop')
    return res
  }

  async dispose(): Promise<LifecycleResult> {
    return this.pipeline.execute()
  }

  async health(): Promise<LifecycleResult> {
    return this.pipeline.execute()
  }

  async restart(): Promise<LifecycleResult> {
    await this.stop()
    return this.start()
  }

  async shutdown(): Promise<LifecycleResult> {
    await this.pipeline.runHook('beforeShutdown')
    const res = await this.pipeline.execute()
    await this.pipeline.runHook('afterShutdown')
    return res
  }

  registerHooks(hooks: LifecycleHooksMap): void {
    Object.keys(hooks).forEach((k) => {
      hooks[k].forEach((fn) => this.pipeline.registerHook(k, fn))
    })
  }
}
