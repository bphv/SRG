/**
 * SearchResult: minimal structure for a search hit.
 */
export interface SearchResult {
  id: string
  title?: string
  snippet?: string
  score?: number
}
