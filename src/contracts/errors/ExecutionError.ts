import type { SrgError } from '#/contracts/errors/SrgError'

export interface ExecutionError extends SrgError {
  executionId?: string
}
