import { createContext, useContext, useMemo, useState } from 'react'
import { PromptService      } from '#/app/services/PromptService'
import type {Prompt, PromptFilters, PromptCreatePayload, PromptUpdatePayload, PromptVersion} from '#/app/services/PromptService';

const defaultFilters: PromptFilters = {
  query: '',
  projectId: 'all',
  status: 'all',
  provider: 'all',
  category: 'all',
  favoritesOnly: false,
  viewMode: 'grid',
  sortKey: 'updatedAt',
  sortOrder: 'desc',
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
  const [filters, setFilters] = useState<PromptFilters>(defaultFilters)
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
    setFilters((current) => ({ ...current, ...updated }))
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
