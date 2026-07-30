import type { Kernel } from '#/core/kernel'
import type { KernelRegistry } from '#/core/registry/KernelRegistry'
import type { ConfigManager } from '#/core/config'
import type { Logger } from '#/core/logger'
import type { EventBus } from '#/core/events'
import type { LifecycleManager } from '#/core/lifecycle'

/**
 * BootstrapContext exposes core runtime references to bootstrap stages.
 * All imports are type-only to avoid runtime coupling.
 */
export interface BootstrapContext {
  kernel?: Kernel
  registry?: KernelRegistry
  config?: ConfigManager
  logger?: Logger
  events?: EventBus
  lifecycle?: LifecycleManager
  // placeholders for later: knowledge, prompt, generator, agents, services
  [key: string]: unknown
}
