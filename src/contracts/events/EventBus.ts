import type { DomainEvent } from '#/contracts/events/DomainEvent'

export interface EventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void> | void): void
  unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void> | void): void
}
