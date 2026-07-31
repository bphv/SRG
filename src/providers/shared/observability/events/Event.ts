export interface Event {
  id: string
  timestamp: string
  type: string
  source: string
  payload?: unknown
  metadata?: Record<string, unknown>
}
