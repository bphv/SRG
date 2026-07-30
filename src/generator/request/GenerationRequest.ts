import type { JsonValue } from '#/types'

/**
 * GenerationRequest: standard request object for generation orchestration.
 */
export interface GenerationRequest {
  id: string
  task?: string
  goal?: string
  instructions?: string
  promptId?: string
  knowledgeIds?: string[]
  variables?: Record<string, JsonValue>
  options?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
}
