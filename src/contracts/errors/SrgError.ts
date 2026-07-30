import type { Metadata } from '#/contracts/common/Metadata'

export interface SrgError {
  code: string
  message: string
  details?: string
  cause?: unknown
  severity?: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Metadata
}
