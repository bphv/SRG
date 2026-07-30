/**
 * State snapshot for GeneratorEngine.
 */
export interface GeneratorEngineState {
  id: string
  status: 'created' | 'initialized' | 'running' | 'stopped' | 'failed'
  lastUpdated?: string
}
