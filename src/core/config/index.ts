import type { JsonValue } from '#/types'

export interface ConfigManagerContract {
  get: <T = JsonValue>(key: string) => T | undefined
  set: <T = JsonValue>(key: string, value: T) => void
  has: (key: string) => boolean
  entries: () => Array<[string, JsonValue]>
}

export class ConfigManager implements ConfigManagerContract {
  private readonly store = new Map<string, JsonValue>()

  get<T = JsonValue>(key: string): T | undefined {
    return this.store.get(key) as T | undefined
  }

  set<T = JsonValue>(key: string, value: T): void {
    this.store.set(key, value as JsonValue)
  }

  has(key: string): boolean {
    return this.store.has(key)
  }

  entries(): Array<[string, JsonValue]> {
    return Array.from(this.store.entries())
  }
}
