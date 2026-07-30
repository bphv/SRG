import type { JsonValue } from '#/types'

export interface ExecutionResponse {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: string
  artifacts?: string[]
  logs?: string[]
  metrics?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
  errors?: string[]
}
