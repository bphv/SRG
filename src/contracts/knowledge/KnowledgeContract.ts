import type { Identifier } from '#/contracts/common/Identifier'
import type { Metadata } from '#/contracts/common/Metadata'
import type { Timestamp } from '#/contracts/common/Timestamp'

export interface KnowledgeContract {
  id: Identifier
  title?: string
  description?: string
  source?: string
  type?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
  metadata?: Metadata
}
