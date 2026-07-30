import type { Identifier } from '#/contracts/common/Identifier'
import type { Metadata } from '#/contracts/common/Metadata'
import type { Timestamp } from '#/contracts/common/Timestamp'
import type { Status } from '#/contracts/common/Status'

export interface GenerationContract {
  id: Identifier
  requestId: Identifier
  promptId?: Identifier
  knowledgeIds?: Identifier[]
  createdAt: Timestamp
  updatedAt?: Timestamp
  status: Status
  metadata?: Metadata
}
