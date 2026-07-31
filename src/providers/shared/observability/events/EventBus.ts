import type { Event } from './Event'

export class EventBus {
  private subscribers: Map<string, Set<(event: Event) => void>> = new Map()

  publish(event: Event): void {
    const subscribers = this.subscribers.get(event.type)
    if (!subscribers) {
      return
    }

    for (const subscriber of subscribers) {
      subscriber(event)
    }
  }

  subscribe(type: string, handler: (event: Event) => void): void {
    const subscribers = this.subscribers.get(type) ?? new Set()
    subscribers.add(handler)
    this.subscribers.set(type, subscribers)
  }

  unsubscribe(type: string, handler: (event: Event) => void): void {
    const subscribers = this.subscribers.get(type)
    if (!subscribers) {
      return
    }

    subscribers.delete(handler)
    if (subscribers.size === 0) {
      this.subscribers.delete(type)
    }
  }

  clear(): void {
    this.subscribers.clear()
  }
}
