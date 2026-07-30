import type { Kernel } from '#/core/kernel'
import type { KernelRegistry } from '#/core/registry/KernelRegistry'
import type { ConfigManager } from '#/core/config'
import type { Logger } from '#/core/logger'

export interface ExecutionEngineContext {
  kernel?: Kernel
  registry?: KernelRegistry
  config?: ConfigManager
  logger?: Logger
  // placeholders for providers, sessions, monitors
  [key: string]: unknown
}
