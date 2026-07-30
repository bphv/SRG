import type { Identifier } from '#/contracts/common/Identifier'
import type { Metadata } from '#/contracts/common/Metadata'

export interface AgentContract {
  id: Identifier
  name: string
  description?: string
  version?: string
  metadata?: Metadata
}
