import type { KnowledgeDocument } from '#/knowledge/documents/KnowledgeDocument'

/**
 * KnowledgeParser: parsing helpers (stubs for different formats).
 */
export class KnowledgeParser {
  async parseMarkdown(_content: string): Promise<KnowledgeDocument | undefined> {
    return undefined
  }

  async parseText(_content: string): Promise<KnowledgeDocument | undefined> {
    return undefined
  }

  async parseJson(_content: string): Promise<KnowledgeDocument | undefined> {
    return undefined
  }

  async parsePdf(_buffer: ArrayBuffer): Promise<KnowledgeDocument | undefined> {
    return undefined
  }

  async parseHtml(_content: string): Promise<KnowledgeDocument | undefined> {
    return undefined
  }
}
