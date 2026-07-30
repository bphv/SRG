import type { Kernel } from '#/core/kernel'
import type { KernelRegistry } from '#/core/registry/KernelRegistry'
import type { ConfigManager } from '#/core/config'
import type { Logger } from '#/core/logger'

/**
 * GenerationContext: runtime context for a generation request.
 */
export interface GenerationContext {
  kernel?: Kernel
  registry?: KernelRegistry
  config?: ConfigManager
  logger?: Logger
  // placeholders: promptEngine, knowledgeEngine, variableResolvers
  [key: string]: unknown
}
