export interface ExecutionEngineOptions {
  mode?: 'sync' | 'async' | 'hybrid'
  defaultProvider?: string
  dryRun?: boolean
}
