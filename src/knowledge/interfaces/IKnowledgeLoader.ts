import type { KnowledgeDocument } from '#/knowledge/documents/KnowledgeDocument'

export interface IKnowledgeLoader {
  loadFile: (path: string) => Promise<KnowledgeDocument | undefined>
  loadFolder: (path: string) => Promise<KnowledgeDocument[]>
  loadStream: (stream: unknown) => Promise<KnowledgeDocument | undefined>
}
