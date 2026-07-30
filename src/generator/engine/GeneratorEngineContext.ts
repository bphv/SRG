import type { Kernel } from '#/core/kernel'
import type { KernelRegistry } from '#/core/registry/KernelRegistry'
import type { ConfigManager } from '#/core/config'
import type { Logger } from '#/core/logger'

/**
 * Contexte pour le GeneratorEngine (type-only imports).
 */
export interface GeneratorEngineContext {
  kernel?: Kernel
  registry?: KernelRegistry
  config?: ConfigManager
  logger?: Logger
  // placeholders: promptEngine, knowledgeEngine, agents
  [key: string]: unknown
}
