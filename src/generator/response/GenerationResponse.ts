import type { JsonValue } from '#/types'

/**
 * GenerationResponse: standardized response from the generator pipeline.
 */
export interface GenerationResponse {
  id: string
  status: 'pending' | 'completed' | 'failed'
  content?: string
  artifacts?: string[]
  warnings?: string[]
  errors?: string[]
  metrics?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
}
