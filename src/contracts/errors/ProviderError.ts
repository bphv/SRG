import type { SrgError } from '#/contracts/errors/SrgError'

export interface ProviderError extends SrgError {
  providerId?: string
}
