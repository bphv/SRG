import type { PromptTemplateMetadata } from './PromptTemplateMetadata'

/**
 * PromptTemplate: canonical representation of a prompt template.
 */
export interface PromptTemplate {
  id: string
  name: string
  title?: string
  description?: string
  version?: string
  author?: string
  category?: string
  domain?: string
  language?: string
  tags?: string[]
  variables?: Record<string, unknown>
  content?: string
  metadata?: PromptTemplateMetadata
}
