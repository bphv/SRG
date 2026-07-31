import type { ProviderStatus } from '#/providers/types/ProviderTypes'
import type { ProviderHealth } from '#/providers/health/ProviderHealth'

export interface IProvider {
  id: string
  name: string
  version?: string
  priority: number
  capabilities: string[]
  status: ProviderStatus
  metadata?: Record<string, unknown>

  initialize: () => Promise<void>
  health: () => Promise<ProviderHealth>
  supports: (capability: string) => boolean
  execute: (request: unknown) => Promise<unknown>
  shutdown: () => Promise<void>
}
