import type { JsonValue } from '#/types'

export interface ExecutionRequest {
  id: string
  generationId?: string
  input?: string
  prompt?: string
  modelHints?: Record<string, JsonValue>
  variables?: Record<string, JsonValue>
  options?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
}
