import type { JsonValue } from '#/types'

/**
 * KnowledgeDocument: canonical document model for SRG knowledge.
 */
export interface KnowledgeDocument {
  id: string
  title: string
  category?: string
  domain?: string
  author?: string
  language?: string
  version?: string
  summary?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  content?: string
  metadata?: Record<string, JsonValue>
}
