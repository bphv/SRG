export interface KnowledgeLoader {
  loadSource(source: string): Promise<unknown>
}

export class KnowledgeLoaderImpl implements KnowledgeLoader {
  async loadSource(source: string): Promise<unknown> {
    return Promise.resolve({ source })
  }
}
