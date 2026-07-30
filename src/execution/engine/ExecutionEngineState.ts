export interface ExecutionEngineState {
  id: string
  status: 'created' | 'initialized' | 'running' | 'stopped' | 'failed'
  lastUpdated?: string
}
