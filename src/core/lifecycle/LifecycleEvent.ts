/**
 * LifecycleEvent: simple event payload for lifecycle transitions.
 */
export interface LifecycleEvent {
  name: string
  timestamp?: string
  details?: Record<string, unknown>
}
