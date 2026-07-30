/**
 * PromptEngineState: lightweight engine state snapshot.
 */
export interface PromptEngineState {
  id: string
  status: 'created' | 'initialized' | 'running' | 'stopped' | 'failed'
  lastUpdated?: string
}
