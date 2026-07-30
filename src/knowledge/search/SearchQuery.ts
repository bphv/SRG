/**
 * SearchQuery: minimal structure for search requests.
 */
export interface SearchQuery {
  q?: string
  title?: string
  category?: string
  domain?: string
  tags?: string[]
  language?: string
  page?: number
  pageSize?: number
}
