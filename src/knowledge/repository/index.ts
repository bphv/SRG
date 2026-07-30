export interface KnowledgeRepository {
  get(id: string): Promise<unknown | undefined>
  save(id: string, payload: unknown): Promise<void>
}

export class KnowledgeRepositoryImpl implements KnowledgeRepository {
  private readonly store = new Map<string, unknown>()

  async get(id: string): Promise<unknown | undefined> {
    return this.store.get(id)
  }

  async save(id: string, payload: unknown): Promise<void> {
    this.store.set(id, payload)
  }
}
