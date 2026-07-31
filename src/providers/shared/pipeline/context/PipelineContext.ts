import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { TransportRequest } from '../../transport/TransportRequest'

export interface PipelineContext {
  request: ExecutionRequest
  transportRequest?: TransportRequest
  provider?: string
  configuration?: Record<string, unknown>
  options?: Record<string, unknown>
  metadata?: Record<string, unknown>
  errors?: PipelineError[]
  warnings?: PipelineWarning[]
}

export interface PipelineError {
  code?: string
  message: string
  details?: Record<string, unknown>
}

export interface PipelineWarning {
  code?: string
  message: string
  details?: Record<string, unknown>
}
