import type { KnowledgeDocument } from '#/knowledge/documents/KnowledgeDocument'

export interface IKnowledgeParser {
  parseMarkdown(content: string): Promise<KnowledgeDocument | undefined>
  parseText(content: string): Promise<KnowledgeDocument | undefined>
  parseJson(content: string): Promise<KnowledgeDocument | undefined>
  parsePdf(buffer: ArrayBuffer): Promise<KnowledgeDocument | undefined>
  parseHtml(content: string): Promise<KnowledgeDocument | undefined>
}
