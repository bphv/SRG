import type { BusinessEvent, BusinessEventType } from '#/business/orchestrator/types'

export type BusinessEventListener = (event: BusinessEvent) => void

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export class BusinessEvents {
  private readonly listeners = new Set<BusinessEventListener>()
  private readonly events: BusinessEvent[] = []

  publish(type: BusinessEventType, payload?: Record<string, unknown>, userId?: string): BusinessEvent {
    const event: BusinessEvent = {
      id: randomId('bev'),
      type,
      at: new Date().toISOString(),
      userId,
      payload,
    }

    this.events.unshift(event)
    if (this.events.length > 1000) {
      this.events.length = 1000
    }

    this.listeners.forEach((listener) => listener(event))
    return event
  }

  subscribe(listener: BusinessEventListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  list(userId?: string): BusinessEvent[] {
    if (!userId) return [...this.events]
    return this.events.filter((item) => item.userId === userId)
  }
}
