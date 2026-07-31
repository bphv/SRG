import type { SessionStore } from '#/app/services/business/session/SessionStore'

export class MemorySessionStore implements SessionStore {
  private readonly memory = new Map<string, string>()

  getItem(key: string): string | null {
    return this.memory.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.memory.set(key, value)
  }

  removeItem(key: string): void {
    this.memory.delete(key)
  }
}
