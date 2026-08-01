import { useMemo, useState } from 'react'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
import type { KnowledgeFilters, KnowledgeDocumentRecord, KnowledgeEnterpriseSearchFilters } from '#/app/services/KnowledgeWorkspaceService'

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

  const persistedEnterprise = preferences.filters['knowledge-enterprise'] as Record<string, string | boolean | number> | undefined
  const defaultEnterprise = KnowledgeWorkspaceService.getEnterpriseSearchDefaults()
  const [enterpriseFilters, setEnterpriseFiltersState] = useState<KnowledgeEnterpriseSearchFilters>({
    text: typeof persistedEnterprise?.text === 'string' ? persistedEnterprise.text : defaultEnterprise.text,
    year: typeof persistedEnterprise?.year === 'string' ? persistedEnterprise.year : defaultEnterprise.year,
    chantier: typeof persistedEnterprise?.chantier === 'string' ? persistedEnterprise.chantier : defaultEnterprise.chantier,
    client: typeof persistedEnterprise?.client === 'string' ? persistedEnterprise.client : defaultEnterprise.client,
    fournisseur: typeof persistedEnterprise?.fournisseur === 'string' ? persistedEnterprise.fournisseur : defaultEnterprise.fournisseur,
    equipement: typeof persistedEnterprise?.equipement === 'string' ? persistedEnterprise.equipement : defaultEnterprise.equipement,
    reference: typeof persistedEnterprise?.reference === 'string' ? persistedEnterprise.reference : defaultEnterprise.reference,
    puissanceKwMin: typeof persistedEnterprise?.puissanceKwMin === 'number' ? persistedEnterprise.puissanceKwMin : defaultEnterprise.puissanceKwMin,
    puissanceKwMax: typeof persistedEnterprise?.puissanceKwMax === 'number' ? persistedEnterprise.puissanceKwMax : defaultEnterprise.puissanceKwMax,
    rpmMin: typeof persistedEnterprise?.rpmMin === 'number' ? persistedEnterprise.rpmMin : defaultEnterprise.rpmMin,
    rpmMax: typeof persistedEnterprise?.rpmMax === 'number' ? persistedEnterprise.rpmMax : defaultEnterprise.rpmMax,
    numeroSerie: typeof persistedEnterprise?.numeroSerie === 'string' ? persistedEnterprise.numeroSerie : defaultEnterprise.numeroSerie,
    technicien: typeof persistedEnterprise?.technicien === 'string' ? persistedEnterprise.technicien : defaultEnterprise.technicien,
    semanticUi: typeof persistedEnterprise?.semanticUi === 'boolean' ? persistedEnterprise.semanticUi : defaultEnterprise.semanticUi,
    favoritesOnly: typeof persistedEnterprise?.favoritesOnly === 'boolean' ? persistedEnterprise.favoritesOnly : defaultEnterprise.favoritesOnly,
  })

  const refresh = () => setTick((value) => value + 1)

  const persistFilters = (next: KnowledgeFilters) => {
    setFilters(next)
    WorkspacePreferencesService.setFilters('knowledge-workspace', next)
  }

  const persistEnterpriseFilters = (next: KnowledgeEnterpriseSearchFilters) => {
    setEnterpriseFiltersState(next)
    WorkspacePreferencesService.setFilters('knowledge-enterprise', next)
  }

  const searchResult = useMemo(() => KnowledgeWorkspaceService.performSearch(filters), [tick, filters])
  const store = useMemo(() => KnowledgeWorkspaceService.getStore(), [tick])
  const summary = useMemo(() => KnowledgeWorkspaceService.getSummary(), [tick])
  const enterpriseDocuments = useMemo(() => KnowledgeWorkspaceService.searchEnterprise(enterpriseFilters, false), [tick, enterpriseFilters])
  const graph = useMemo(() => KnowledgeWorkspaceService.buildDocumentGraph(), [tick])

  const selectedByIds = (ids: string[]): KnowledgeDocumentRecord[] => store.documents.filter((item) => ids.includes(item.id))

  return {
    tick,
    filters,
    setFilters: persistFilters,
    enterpriseFilters,
    setEnterpriseFilters: persistEnterpriseFilters,
    store,
    summary,
    documents: searchResult.documents,
    enterpriseDocuments,
    graph,
    ocrQueue: store.ocrQueue,
    decompressions: store.decompressions,
    aiAnswers: store.aiAnswers,
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
  return value === 'all' || value === 'markdown' || value === 'txt' || value === 'pdf' || value === 'doc' || value === 'docx' || value === 'xls' || value === 'xlsx' || value === 'csv' || value === 'json' || value === 'xml' || value === 'html' || value === 'image' || value === 'audio' || value === 'video' || value === 'email-export' || value === 'technical-plan' || value === 'scan' || value === 'invoice' || value === 'delivery-note' || value === 'receipt-note' || value === 'photo' || value === 'report' || value === 'web-link' || value === 'note' || value === 'faq' || value === 'guide' || value === 'documentation'
}

function isStatus(value: unknown): value is KnowledgeFilters['status'] {
  return value === 'all' || value === 'draft' || value === 'validated' || value === 'archived' || value === 'trash'
}

function isSort(value: unknown): value is KnowledgeFilters['sort'] {
  return value === 'updatedAt:desc' || value === 'updatedAt:asc' || value === 'title:asc' || value === 'title:desc' || value === 'score:desc'
}
