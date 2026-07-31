import type { KnowledgeDocument } from '#/knowledge/documents/KnowledgeDocument'

export interface IKnowledgeRepository {
  save: (doc: KnowledgeDocument) => Promise<void>
  update: (id: string, doc: Partial<KnowledgeDocument>) => Promise<void>
  delete: (id: string) => Promise<void>
  findById: (id: string) => Promise<KnowledgeDocument | undefined>
  findAll: () => Promise<KnowledgeDocument[]>
  findByCategory: (category: string) => Promise<KnowledgeDocument[]>
  findByDomain: (domain: string) => Promise<KnowledgeDocument[]>
  findByTags: (tags: string[]) => Promise<KnowledgeDocument[]>
}
