import type { Identifier } from '#/contracts/common/Identifier'
import type { Metadata } from '#/contracts/common/Metadata'
import type { ProviderCapability } from '#/contracts/provider/ProviderCapability'

export interface ProviderContract {
  id: Identifier
  name: string
  version?: string
  capabilities: ProviderCapability[]
  priority?: number
  metadata?: Metadata
}
