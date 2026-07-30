import type { ComponentStatus } from './ComponentTypes'

/**
 * ComponentState describes a strongly-typed snapshot of a component's state.
 */
export interface ComponentState {
  id: string
  status: ComponentStatus
  lastUpdated?: string
  health?: unknown
  details?: Record<string, unknown>
}
