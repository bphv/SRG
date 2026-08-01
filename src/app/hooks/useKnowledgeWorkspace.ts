import { useMemo, useState } from 'react'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
import type { KnowledgeFilters, KnowledgeDocumentRecord } from '#/app/services/KnowledgeWorkspaceService'

export function useKnowledgeWorkspace() {
  const [tick, setTick] = useState(0)
  const preferences = WorkspacePreferencesService.getPreferences()
  const persisted = preferences.filters['knowledge-workspace'] as Record<string, string | boolean | number> | undefined

  const [filters, setFilters] = useState<KnowledgeFilters>({
    search: typeof persisted?.search === 'string' ? persisted.search : '',
    category: typeof persisted?.category === 'string' ? persisted.category : 'all',
    tag: typeof persisted?.tag === 'string' ? persisted.tag : '',
    author: typeof persisted?.author === 'string' ? persisted.author : '',
    date: typeof persisted?.date === 'string' ? persisted.date : '',
    type: isType(persisted?.type) ? persisted.type : 'all',
    status: isStatus(persisted?.status) ? persisted.status : 'all',
    favoritesOnly: typeof persisted?.favoritesOnly === 'boolean' ? persisted.favoritesOnly : false,
    sort: isSort(persisted?.sort) ? persisted.sort : 'updatedAt:desc',
    semanticUi: typeof persisted?.semanticUi === 'boolean' ? persisted.semanticUi : false,
  })

  const refresh = () => setTick((value) => value + 1)

  const persistFilters = (next: KnowledgeFilters) => {
    setFilters(next)
    WorkspacePreferencesService.setFilters('knowledge-workspace', next)
  }

  const searchResult = useMemo(() => KnowledgeWorkspaceService.performSearch(filters), [tick, filters])
  const store = useMemo(() => KnowledgeWorkspaceService.getStore(), [tick])
  const summary = useMemo(() => KnowledgeWorkspaceService.getSummary(), [tick])

  const selectedByIds = (ids: string[]): KnowledgeDocumentRecord[] => store.documents.filter((item) => ids.includes(item.id))

  return {
    tick,
    filters,
    setFilters: persistFilters,
    store,
    summary,
    documents: searchResult.documents,
    suggestions: searchResult.suggestions,
    similarDocuments: searchResult.similar,
    categories: KnowledgeWorkspaceService.listCategories(),
    tags: KnowledgeWorkspaceService.listTags(),
    authors: KnowledgeWorkspaceService.listAuthors(),
    selectedByIds,
    refresh,
  }
}

function isType(value: unknown): value is KnowledgeFilters['type'] {
  return value === 'all' || value === 'markdown' || value === 'txt' || value === 'pdf' || value === 'docx' || value === 'csv' || value === 'json' || value === 'xml' || value === 'html' || value === 'image' || value === 'audio' || value === 'video' || value === 'web-link' || value === 'note' || value === 'faq' || value === 'guide' || value === 'documentation'
}

function isStatus(value: unknown): value is KnowledgeFilters['status'] {
  return value === 'all' || value === 'draft' || value === 'validated' || value === 'archived' || value === 'trash'
}

function isSort(value: unknown): value is KnowledgeFilters['sort'] {
  return value === 'updatedAt:desc' || value === 'updatedAt:asc' || value === 'title:asc' || value === 'title:desc' || value === 'score:desc'
}
