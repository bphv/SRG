import type { SessionStore } from '#/app/services/business/session/SessionStore'
import { MemorySessionStore } from '#/app/services/business/session/MemorySessionStore'

// Stub implementation only, no network calls.
export class SupabaseSessionStore implements SessionStore {
  private readonly memory = new MemorySessionStore()

  getItem(key: string): string | null {
    return this.memory.getItem(key)
  }

  setItem(key: string, value: string): void {
    this.memory.setItem(key, value)
  }

  removeItem(key: string): void {
    this.memory.removeItem(key)
  }
}
