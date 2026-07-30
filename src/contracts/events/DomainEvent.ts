import type { Identifier } from '#/contracts/common/Identifier'
import type { Metadata } from '#/contracts/common/Metadata'
import type { Timestamp } from '#/contracts/common/Timestamp'

export interface DomainEvent {
  id: Identifier
  type: string
  source: string
  timestamp: Timestamp
  payload?: unknown
  metadata?: Metadata
}
