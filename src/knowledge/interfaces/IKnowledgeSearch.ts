import type { SearchQuery } from '#/knowledge/search/SearchQuery'
import type { SearchResult } from '#/knowledge/search/SearchResult'

export interface IKnowledgeSearch {
  search: (query: SearchQuery) => Promise<SearchResult[]>
  searchByTitle: (title: string) => Promise<SearchResult[]>
  searchByCategory: (category: string) => Promise<SearchResult[]>
  searchByDomain: (domain: string) => Promise<SearchResult[]>
  searchByTags: (tags: string[]) => Promise<SearchResult[]>
  searchByKeyword: (keyword: string) => Promise<SearchResult[]>
}
