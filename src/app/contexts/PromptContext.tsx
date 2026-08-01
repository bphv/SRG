import { createContext, useContext, useMemo, useState } from 'react'
import { PromptService      } from '#/app/services/PromptService'
import type {Prompt, PromptFilters, PromptCreatePayload, PromptUpdatePayload, PromptVersion} from '#/app/services/PromptService';
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

function buildDefaultFilters(): PromptFilters {
  const preferences = WorkspacePreferencesService.getPreferences()
  const persistedFilters = (preferences.filters['prompt-studio'] as Record<string, string | boolean | number> | undefined) || {}
  const persistedSortValue = preferences.sorts['prompt-studio']
  const safePersistedSort = typeof persistedSortValue === 'string' && persistedSortValue.length > 0 ? persistedSortValue : 'updatedAt:desc'
  const [sortKey, sortOrder] = safePersistedSort.split(':') as [PromptFilters['sortKey'], PromptFilters['sortOrder']]
  const layout = preferences.pageLayouts['prompt-studio']

  return {
    query: typeof persistedFilters.query === 'string' ? persistedFilters.query : '',
    projectId: typeof persistedFilters.projectId === 'string' ? persistedFilters.projectId : 'all',
    status: persistedFilters.status === 'active' || persistedFilters.status === 'archived' || persistedFilters.status === 'draft' ? persistedFilters.status : 'all',
    provider: persistedFilters.provider === 'OpenAI' || persistedFilters.provider === 'Anthropic' || persistedFilters.provider === 'Azure OpenAI' || persistedFilters.provider === 'Cohere' ? persistedFilters.provider : 'all',
    category: persistedFilters.category === 'summary' || persistedFilters.category === 'onboarding' || persistedFilters.category === 'research' || persistedFilters.category === 'marketing' || persistedFilters.category === 'utility' ? persistedFilters.category : 'all',
    favoritesOnly: persistedFilters.favoritesOnly === true,
    viewMode: layout === 'list' ? 'list' : 'grid',
    sortKey: sortKey,
    sortOrder: sortOrder,
  }
}

type PromptContextValue = {
  prompts: Prompt[]
  selectedPrompt: Prompt | null
  loading: boolean
  filters: PromptFilters
  history: PromptVersion[]
  refresh: () => Promise<void>
  selectPrompt: (id: string | null) => void
  applyFilters: (filters: Partial<PromptFilters>) => void
  createPrompt: (payload: PromptCreatePayload) => Prompt
  updatePrompt: (id: string, payload: PromptUpdatePayload) => Prompt | undefined
  deletePrompt: (id: string) => void
  duplicatePrompt: (id: string) => Prompt | undefined
  archivePrompt: (id: string) => Prompt | undefined
  favoritePrompt: (id: string) => Prompt | undefined
  publishPrompt: (id: string, visibility?: 'internal' | 'public') => Prompt | undefined
}

const PromptContext = createContext<PromptContextValue | undefined>(undefined)

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>(PromptService.getPrompts())
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [filters, setFilters] = useState<PromptFilters>(buildDefaultFilters)
  const [history, setHistory] = useState<PromptVersion[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 200))
    setPrompts(PromptService.getPrompts())
    setLoading(false)
  }

  const selectPrompt = (id: string | null) => {
    const prompt = id ? PromptService.getPrompt(id) : undefined
    setSelectedPrompt(prompt ?? null)
    setHistory(prompt ? PromptService.getHistory(prompt.id) : [])
  }

  const applyFilters = (updated: Partial<PromptFilters>) => {
    setFilters((current) => {
      const next = { ...current, ...updated }
      WorkspacePreferencesService.setPageLayout('prompt-studio', next.viewMode)
      WorkspacePreferencesService.setSort('prompt-studio', `${next.sortKey}:${next.sortOrder}`)
      WorkspacePreferencesService.setFilters('prompt-studio', {
        query: next.query,
        projectId: next.projectId,
        status: next.status,
        provider: next.provider,
        category: next.category,
        favoritesOnly: next.favoritesOnly,
      })
      return next
    })
  }

  const createPrompt = (payload: PromptCreatePayload) => {
    const prompt = PromptService.createPrompt(payload)
    refresh()
    return prompt
  }

  const updatePrompt = (id: string, payload: PromptUpdatePayload) => {
    const prompt = PromptService.updatePrompt(id, payload)
    refresh()
    if (prompt?.id === selectedPrompt?.id) {
      setSelectedPrompt(prompt ?? null)
      if (prompt) {
        setHistory(PromptService.getHistory(prompt.id))
      }
    }
    return prompt
  }

  const deletePrompt = (id: string) => {
    PromptService.deletePrompt(id)
    refresh()
    if (selectedPrompt?.id === id) {
      setSelectedPrompt(null)
      setHistory([])
    }
  }

  const duplicatePrompt = (id: string) => {
    const prompt = PromptService.duplicatePrompt(id)
    refresh()
    return prompt
  }

  const archivePrompt = (id: string) => {
    const prompt = PromptService.archivePrompt(id)
    refresh()
    return prompt
  }

  const favoritePrompt = (id: string) => {
    const prompt = PromptService.favoritePrompt(id)
    refresh()
    return prompt
  }

  const publishPrompt = (id: string, visibility: 'internal' | 'public' = 'internal') => {
    const prompt = PromptService.publishPrompt(id, visibility)
    refresh()
    if (prompt && prompt.id === selectedPrompt?.id) {
      setSelectedPrompt(prompt)
      setHistory(PromptService.getHistory(prompt.id))
    }
    return prompt
  }

  const value = useMemo(
    () => ({
      prompts,
      selectedPrompt,
      loading,
      filters,
      history,
      refresh,
      selectPrompt,
      applyFilters,
      createPrompt,
      updatePrompt,
      deletePrompt,
      duplicatePrompt,
      archivePrompt,
      favoritePrompt,
      publishPrompt,
    }),
    [prompts, selectedPrompt, loading, filters, history],
  )

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>
}

export function usePromptContext() {
  const context = useContext(PromptContext)
  if (!context) {
    throw new Error('usePromptContext must be used inside PromptProvider')
  }
  return context
}
