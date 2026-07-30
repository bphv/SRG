import type { Kernel } from '#/core/kernel'
import type { KernelRegistry } from '#/core/registry/KernelRegistry'
import type { ConfigManager } from '#/core/config'
import type { Logger } from '#/core/logger'

/**
 * Context passed to the KnowledgeEngine. Type-only imports to avoid runtime coupling.
 */
export interface KnowledgeEngineContext {
  kernel?: Kernel
  registry?: KernelRegistry
  config?: ConfigManager
  logger?: Logger
  // placeholders for knowledge subsystems
  [key: string]: unknown
}
