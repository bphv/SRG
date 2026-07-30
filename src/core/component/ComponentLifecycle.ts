import type { ComponentStatus } from './ComponentTypes'

/**
 * ComponentLifecycle provides lifecycle hooks for SRG components.
 * Implementations should override methods when needed. Methods are stubs.
 */
export abstract class ComponentLifecycle {
  status: ComponentStatus = 'created'

  async initialize(): Promise<void> {
    // stub
  }

  async configure(): Promise<void> {
    // stub
  }

  async start(): Promise<void> {
    // stub
  }

  async pause(): Promise<void> {
    // stub
  }

  async resume(): Promise<void> {
    // stub
  }

  async reload(): Promise<void> {
    // stub
  }

  async stop(): Promise<void> {
    // stub
  }

  async dispose(): Promise<void> {
    // stub
  }

  async health(): Promise<unknown> {
    return Promise.resolve({ status: this.status })
  }

  async validate(): Promise<boolean> {
    return Promise.resolve(true)
  }
}
