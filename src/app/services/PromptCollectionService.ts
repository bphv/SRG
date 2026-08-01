import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export type PromptCollectionKind =
  | 'favorites'
  | 'recently_used'
  | 'recently_published'
  | 'pinned'
  | 'archived'
  | 'templates'
  | 'custom'

export type PromptCollection = {
  id: string
  name: string
  kind: PromptCollectionKind
  promptIds: string[]
  order: number
  createdAt: string
  updatedAt: string
  open: boolean
}

const STORAGE_KEY = 'srg.prompt.collections.v1'

function nowIso() {
  return new Date().toISOString()
}

function defaults(): PromptCollection[] {
  const now = nowIso()
  return [
    { id: 'col-favorites', name: 'Favorites', kind: 'favorites', promptIds: [], order: 1, createdAt: now, updatedAt: now, open: true },
    { id: 'col-recent-used', name: 'Recently Used', kind: 'recently_used', promptIds: [], order: 2, createdAt: now, updatedAt: now, open: true },
    { id: 'col-recent-published', name: 'Recently Published', kind: 'recently_published', promptIds: [], order: 3, createdAt: now, updatedAt: now, open: true },
    { id: 'col-pinned', name: 'Pinned', kind: 'pinned', promptIds: [], order: 4, createdAt: now, updatedAt: now, open: true },
    { id: 'col-archived', name: 'Archived', kind: 'archived', promptIds: [], order: 5, createdAt: now, updatedAt: now, open: false },
    { id: 'col-templates', name: 'Templates', kind: 'templates', promptIds: [], order: 6, createdAt: now, updatedAt: now, open: true },
  ]
}

export class PromptCollectionService {
  private static memory = defaults()

  static list(): PromptCollection[] {
    return this.readStorage().sort((a, b) => a.order - b.order)
  }

  static createCustomCollection(name: string): PromptCollection {
    const list = this.list()
    const next: PromptCollection = {
      id: `col-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      name,
      kind: 'custom',
      promptIds: [],
      order: list.length + 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      open: true,
    }
    this.writeStorage([...list, next])
    return next
  }

  static renameCollection(id: string, name: string): void {
    this.writeStorage(this.list().map((item) => (item.id === id ? { ...item, name, updatedAt: nowIso() } : item)))
  }

  static deleteCollection(id: string): void {
    this.writeStorage(this.list().filter((item) => item.id !== id))
  }

  static addPrompt(collectionId: string, promptId: string): void {
    this.writeStorage(
      this.list().map((item) =>
        item.id === collectionId
          ? {
              ...item,
              promptIds: item.promptIds.includes(promptId) ? item.promptIds : [promptId, ...item.promptIds],
              updatedAt: nowIso(),
            }
          : item,
      ),
    )
  }

  static removePrompt(collectionId: string, promptId: string): void {
    this.writeStorage(
      this.list().map((item) =>
        item.id === collectionId ? { ...item, promptIds: item.promptIds.filter((id) => id !== promptId), updatedAt: nowIso() } : item,
      ),
    )
  }

  static movePrompt(promptId: string, fromCollectionId: string, toCollectionId: string): void {
    this.removePrompt(fromCollectionId, promptId)
    this.addPrompt(toCollectionId, promptId)
  }

  static reorderCollections(idsInOrder: string[]): void {
    const map = new Map(idsInOrder.map((id, index) => [id, index + 1]))
    this.writeStorage(this.list().map((item) => ({ ...item, order: map.get(item.id) ?? item.order, updatedAt: nowIso() })))
  }

  static setOpen(id: string, open: boolean): void {
    this.writeStorage(this.list().map((item) => (item.id === id ? { ...item, open, updatedAt: nowIso() } : item)))
    WorkspacePreferencesService.setFilters('prompt-collections-open', {
      ...Object.fromEntries(this.list().map((item) => [item.id, item.open])),
      [id]: open,
    })
  }

  private static readStorage(): PromptCollection[] {
    if (typeof window === 'undefined') return this.memory
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = defaults()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }
      const parsed = JSON.parse(raw) as PromptCollection[]
      return Array.isArray(parsed) ? parsed : defaults()
    } catch {
      return defaults()
    }
  }

  private static writeStorage(collections: PromptCollection[]): void {
    this.memory = collections
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
    }
  }
}
