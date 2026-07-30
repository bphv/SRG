/**
 * Lightweight state snapshot for KnowledgeEngine.
 */
export interface KnowledgeEngineState {
  id: string
  status: 'created' | 'initialized' | 'running' | 'stopped' | 'failed'
  lastUpdated?: string
}
