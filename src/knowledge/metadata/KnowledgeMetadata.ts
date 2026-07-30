/**
 * KnowledgeMetadata: metadata about a document's source and format.
 */
export interface KnowledgeMetadata {
  source?: string
  format?: string
  mimeType?: string
  size?: number
  checksum?: string
  license?: string
  status?: string
  confidence?: number
}
