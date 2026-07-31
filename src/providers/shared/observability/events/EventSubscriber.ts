import type { Event } from './Event'
import type { EventBus } from './EventBus'

export class EventSubscriber {
  constructor(private readonly bus: EventBus) {}

  subscribe(type: string, handler: (event: Event) => void): void {
    this.bus.subscribe(type, handler)
  }

  unsubscribe(type: string, handler: (event: Event) => void): void {
    this.bus.unsubscribe(type, handler)
  }
}
