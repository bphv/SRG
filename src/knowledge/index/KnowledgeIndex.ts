/**
 * KnowledgeIndex: structure describing indexed fields for quick lookup.
 */
export interface KnowledgeIndex {
  byTitle?: Map<string, string[]> // title -> [docId]
  byCategory?: Map<string, string[]>
  byDomain?: Map<string, string[]>
  byTag?: Map<string, string[]>
  byKeyword?: Map<string, string[]>
  byLanguage?: Map<string, string[]>
}
