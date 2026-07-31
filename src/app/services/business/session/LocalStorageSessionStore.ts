import type { SessionStore } from '#/app/services/business/session/SessionStore'
import { MemorySessionStore } from '#/app/services/business/session/MemorySessionStore'

export class LocalStorageSessionStore implements SessionStore {
  private readonly fallback = new MemorySessionStore()

  getItem(key: string): string | null {
    if (typeof window === 'undefined') {
      return this.fallback.getItem(key)
    }
    return window.localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') {
      this.fallback.setItem(key, value)
      return
    }
    window.localStorage.setItem(key, value)
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') {
      this.fallback.removeItem(key)
      return
    }
    window.localStorage.removeItem(key)
  }
}
