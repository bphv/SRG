export interface EventPayload {
  [key: string]: unknown
}

export type EventListener = (payload: EventPayload) => void | Promise<void>

export interface EventBus {
  on(event: string, listener: EventListener): void
  off(event: string, listener: EventListener): void
  emit(event: string, payload?: EventPayload): Promise<void>
}

export class EventBusImpl implements EventBus {
  private readonly listeners = new Map<string, Set<EventListener>>()

  on(event: string, listener: EventListener): void {
    const handlers = this.listeners.get(event) ?? new Set<EventListener>()
    handlers.add(listener)
    this.listeners.set(event, handlers)
  }

  off(event: string, listener: EventListener): void {
    const handlers = this.listeners.get(event)
    handlers?.delete(listener)
  }

  async emit(event: string, payload: EventPayload = {}): Promise<void> {
    const handlers = this.listeners.get(event)
    if (!handlers) {
      return
    }

    await Promise.all(Array.from(handlers).map((handler) => handler(payload)))
  }
}
