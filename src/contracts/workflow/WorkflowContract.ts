import type { Identifier } from '#/contracts/common/Identifier'
import type { Metadata } from '#/contracts/common/Metadata'
import type { Timestamp } from '#/contracts/common/Timestamp'
import type { Status } from '#/contracts/common/Status'

export interface WorkflowContract {
  id: Identifier
  name: string
  description?: string
  currentStep?: string
  status: Status
  createdAt: Timestamp
  updatedAt?: Timestamp
  metadata?: Metadata
}
