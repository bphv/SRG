import type { Kernel } from '#/core/kernel'
import type { KernelRegistry } from '#/core/registry/KernelRegistry'
import type { Logger } from '#/core/logger'
import type { ConfigManager } from '#/core/config'
import type { EventBus } from '#/core/events'

/**
 * ComponentContext provides late-bound references to core runtime facilities.
 * All imports are type-only to avoid runtime coupling.
 */
export interface ComponentContext {
  kernel?: Kernel
  registry?: KernelRegistry
  logger?: Logger
  config?: ConfigManager
  events?: EventBus
  // Future expansions: knowledgeCenter, promptEngine, generator, agents, etc.
  [key: string]: unknown
}
