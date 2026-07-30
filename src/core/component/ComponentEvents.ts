/**
 * ComponentEvents - placeholder types for component-level events.
 */
export interface ComponentEventPayload {
  [key: string]: unknown
}

export type ComponentEventListener = (payload: ComponentEventPayload) => void | Promise<void>

export interface ComponentEventMap {
  [eventName: string]: ComponentEventListener[]
}
