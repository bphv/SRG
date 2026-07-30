export interface KnowledgeParser {
  parse(payload: unknown): Promise<unknown>
}

export class KnowledgeParserImpl implements KnowledgeParser {
  async parse(payload: unknown): Promise<unknown> {
    return Promise.resolve(payload)
  }
}
