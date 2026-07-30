import type { Kernel } from '#/core/kernel'
import type { KernelRegistry } from '#/core/registry/KernelRegistry'
import type { ConfigManager } from '#/core/config'
import type { Logger } from '#/core/logger'

/**
 * Context available to the Prompt Engine at runtime.
 * Type-only imports avoid runtime coupling.
 */
export interface PromptEngineContext {
  kernel?: Kernel
  registry?: KernelRegistry
  config?: ConfigManager
  logger?: Logger
  // placeholders: knowledge, generator, agents
  [key: string]: unknown
}
