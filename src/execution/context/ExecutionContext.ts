import type { Kernel } from '#/core/kernel'
import type { ProviderRegistry } from '#/execution/registry/ProviderRegistry'
import type { ConfigManager } from '#/core/config'
import type { Logger } from '#/core/logger'

export interface ExecutionContext {
  kernel?: Kernel
  providerRegistry?: ProviderRegistry
  config?: ConfigManager
  logger?: Logger
  session?: Record<string, unknown>
  [key: string]: unknown
}
