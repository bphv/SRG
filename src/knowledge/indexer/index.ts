export interface KnowledgeIndexer {
  index: (data: unknown) => Promise<void>
}

export class KnowledgeIndexerImpl implements KnowledgeIndexer {
  async index(_data: unknown): Promise<void> {
    return Promise.resolve()
  }
}
