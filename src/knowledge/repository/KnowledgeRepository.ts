import type { KnowledgeDocument } from '#/knowledge/documents/KnowledgeDocument'

/**
 * KnowledgeRepository: basic repository contract for persistence (stub implementation).
 */
export class KnowledgeRepository {
  private readonly store = new Map<string, KnowledgeDocument>()

  async save(doc: KnowledgeDocument): Promise<void> {
    this.store.set(doc.id, doc)
  }

  async update(_id: string, _doc: Partial<KnowledgeDocument>): Promise<void> {
    // stub
  }

  async delete(_id: string): Promise<void> {
    // stub
  }

  async findById(id: string): Promise<KnowledgeDocument | undefined> {
    return this.store.get(id)
  }

  async findAll(): Promise<KnowledgeDocument[]> {
    return Array.from(this.store.values())
  }

  async findByCategory(_category: string): Promise<KnowledgeDocument[]> {
    return []
  }

  async findByDomain(_domain: string): Promise<KnowledgeDocument[]> {
    return []
  }

  async findByTags(_tags: string[]): Promise<KnowledgeDocument[]> {
    return []
  }
}
