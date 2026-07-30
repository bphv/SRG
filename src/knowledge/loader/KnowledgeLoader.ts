import type { KnowledgeDocument } from '#/knowledge/documents/KnowledgeDocument'

/**
 * KnowledgeLoader: abstract loader for files/folders/streams (stubs).
 */
export class KnowledgeLoader {
  async loadFile(_path: string): Promise<KnowledgeDocument | undefined> {
    return undefined
  }

  async loadFolder(_path: string): Promise<KnowledgeDocument[]> {
    return []
  }

  async loadStream(_stream: unknown): Promise<KnowledgeDocument | undefined> {
    return undefined
  }
}
