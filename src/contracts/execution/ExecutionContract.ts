import type { Identifier } from '#/contracts/common/Identifier'
import type { Metadata } from '#/contracts/common/Metadata'
import type { Timestamp } from '#/contracts/common/Timestamp'
import type { Status } from '#/contracts/common/Status'

export interface ExecutionContract {
  id: Identifier
  generationId: Identifier
  providerId?: Identifier
  startTime?: Timestamp
  endTime?: Timestamp
  status: Status
  metadata?: Metadata
}
