import type { Identifier } from '#/contracts/common/Identifier'
import type { Metadata } from '#/contracts/common/Metadata'
import type { Timestamp } from '#/contracts/common/Timestamp'

export interface PromptContract {
  id: Identifier
  name: string
  description?: string
  template: string
  createdAt: Timestamp
  updatedAt?: Timestamp
  metadata?: Metadata
}
