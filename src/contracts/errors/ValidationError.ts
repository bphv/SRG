import type { SrgError } from '#/contracts/errors/SrgError'

export interface ValidationError extends SrgError {
  field?: string
}
