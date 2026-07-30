import type { KnowledgeDocument } from '#/knowledge/documents/KnowledgeDocument'
import type { KnowledgeIndex } from './KnowledgeIndex'

/**
 * Indexer: responsible for updating the KnowledgeIndex (stubs only).
 */
export class Indexer {
  private index: KnowledgeIndex = {
    byTitle: new Map(),
    byCategory: new Map(),
    byDomain: new Map(),
    byTag: new Map(),
    byKeyword: new Map(),
    byLanguage: new Map(),
  }

  async indexDocument(_doc: KnowledgeDocument): Promise<void> {
    // stub
  }

  getIndex(): KnowledgeIndex {
    return this.index
  }
}
