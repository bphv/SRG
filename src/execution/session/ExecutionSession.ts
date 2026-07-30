export interface ExecutionSession {
  id: string
  providerId?: string
  startTime?: string
  endTime?: string
  status?: 'initialized' | 'active' | 'closed' | 'failed'
  metadata?: Record<string, unknown>
}
