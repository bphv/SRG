export interface RegistryEntry {
  id: string
}

export interface RegistryContract<T extends RegistryEntry> {
  register: (entry: T) => void
  unregister: (id: string) => void
  has: (id: string) => boolean
  get: (id: string) => T | undefined
  getAll: () => T[]
  clear: () => void
}

export abstract class BaseRegistry<T extends RegistryEntry> implements RegistryContract<T> {
  protected readonly entries = new Map<string, T>()

  register(entry: T): void {
    this.entries.set(entry.id, entry)
  }

  unregister(id: string): void {
    this.entries.delete(id)
  }

  has(id: string): boolean {
    return this.entries.has(id)
  }

  get(id: string): T | undefined {
    return this.entries.get(id)
  }

  getAll(): T[] {
    return Array.from(this.entries.values())
  }

  clear(): void {
    this.entries.clear()
  }
}
