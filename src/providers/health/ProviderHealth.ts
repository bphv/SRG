import type { ProviderStatus } from '#/providers/types/ProviderTypes'

export interface ProviderHealth {
  status: ProviderStatus
  latency: number
  availability: number
  lastCheck: string
}
