import type { TransportRequest } from '../../transport/TransportRequest'
import type { PipelineError, PipelineWarning } from '../context/PipelineContext'

export interface PipelineResult {
  success: boolean
  transportRequest?: TransportRequest
  errors: PipelineError[]
  warnings: PipelineWarning[]
  metadata: Record<string, unknown>
}
