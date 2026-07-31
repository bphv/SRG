import type { Event } from './Event'
import { EventBus } from './EventBus'

export class EventPublisher {
  constructor(private readonly bus: EventBus) {}

  publish(type: string, source: string, payload?: unknown, metadata?: Record<string, unknown>): Event {
    const event: Event = {
      id: `evt-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      source,
      payload,
      metadata,
    }

    this.bus.publish(event)
    return event
  }
}
