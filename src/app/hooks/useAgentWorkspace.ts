import { useMemo, useState } from 'react'
import { AgentWorkspaceService } from '#/app/services/AgentWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
import type { AgentFilters } from '#/app/services/AgentWorkspaceService'

export function useAgentWorkspace() {
  const [tick, setTick] = useState(0)

  const preferences = WorkspacePreferencesService.getPreferences()
  const persisted = preferences.filters.agents as Record<string, string | boolean | number> | undefined
  const [filters, setFilters] = useState<AgentFilters>({
    search: typeof persisted?.search === 'string' ? persisted.search : '',
    category: typeof persisted?.category === 'string' ? persisted.category : 'all',
    tag: typeof persisted?.tag === 'string' ? persisted.tag : '',
    status: persisted?.status === 'idle' || persisted?.status === 'running' || persisted?.status === 'paused' || persisted?.status === 'completed' || persisted?.status === 'failed' || persisted?.status === 'cancelled' ? persisted.status : 'all',
    favoritesOnly: typeof persisted?.favoritesOnly === 'boolean' ? persisted.favoritesOnly : false,
    sort: persisted?.sort === 'updatedAt:asc' || persisted?.sort === 'name:asc' || persisted?.sort === 'name:desc' ? persisted.sort : 'updatedAt:desc',
  })

  const refresh = () => setTick((value) => value + 1)

  const persistFilters = (next: AgentFilters) => {
    setFilters(next)
    WorkspacePreferencesService.setFilters('agents', {
      search: next.search,
      category: next.category,
      tag: next.tag,
      status: next.status,
      favoritesOnly: next.favoritesOnly,
      sort: next.sort,
    })
  }

  const store = useMemo(() => AgentWorkspaceService.getStore(), [tick])
  const filteredAgents = useMemo(() => AgentWorkspaceService.filterAgents(filters), [tick, filters])
  const summary = useMemo(() => AgentWorkspaceService.getSummary(), [tick])

  return {
    tick,
    filters,
    setFilters: persistFilters,
    store,
    filteredAgents,
    summary,
    toolsCatalog: AgentWorkspaceService.getToolsCatalog(),
    refresh,
  }
}
