export interface IKnowledgeEngine {
  discover(): Promise<void>
  index(): Promise<void>
  search(query?: unknown): Promise<unknown[]>
  // lifecycle hooks could be added here
}
