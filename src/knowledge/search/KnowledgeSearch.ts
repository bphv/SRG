import type { SearchQuery } from './SearchQuery'
import type { SearchResult } from './SearchResult'

/**
 * KnowledgeSearch: search interfaces (stubs).
 */
export class KnowledgeSearch {
  async search(_query: SearchQuery): Promise<SearchResult[]> {
    return []
  }

  async searchByTitle(_title: string): Promise<SearchResult[]> {
    return []
  }

  async searchByCategory(_category: string): Promise<SearchResult[]> {
    return []
  }

  async searchByDomain(_domain: string): Promise<SearchResult[]> {
    return []
  }

  async searchByTags(_tags: string[]): Promise<SearchResult[]> {
    return []
  }

  async searchByKeyword(_keyword: string): Promise<SearchResult[]> {
    return []
  }
}
