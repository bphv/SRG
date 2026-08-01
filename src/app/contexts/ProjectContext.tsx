import { createContext, useContext, useMemo, useState } from 'react'
import { ProjectService     } from '#/app/services/ProjectService'
import type {Project, ProjectFilters, ProjectCreatePayload, ProjectUpdatePayload} from '#/app/services/ProjectService';
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

type ProjectContextValue = {
  projects: Project[]
  selectedProject: Project | null
  loading: boolean
  filters: ProjectFilters
  refresh: () => Promise<void>
  selectProject: (id: string | null) => void
  applyFilters: (filters: Partial<ProjectFilters>) => void
  createProject: (payload: ProjectCreatePayload) => Project
  updateProject: (id: string, payload: ProjectUpdatePayload) => Project | undefined
  archiveProject: (id: string) => Project | undefined
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => Project | undefined
  favoriteProject: (id: string) => Project | undefined
}

function buildDefaultFilters(): ProjectFilters {
  const preferences = WorkspacePreferencesService.getPreferences()
  const persistedFilters = (preferences.filters.projects as Record<string, string | boolean | number> | undefined) || {}
  const persistedSortValue = preferences.sorts.projects
  const safePersistedSort = typeof persistedSortValue === 'string' && persistedSortValue.length > 0 ? persistedSortValue : 'updatedAt:desc'
  const [sortKey, sortOrder] = safePersistedSort.split(':') as [ProjectFilters['sortKey'], ProjectFilters['sortOrder']]
  const layout = preferences.pageLayouts.projects

  return {
    query: typeof persistedFilters.query === 'string' ? persistedFilters.query : '',
    status: persistedFilters.status === 'active' || persistedFilters.status === 'archived' || persistedFilters.status === 'draft' ? persistedFilters.status : 'all',
    provider: persistedFilters.provider === 'OpenAI' || persistedFilters.provider === 'Anthropic' || persistedFilters.provider === 'Azure OpenAI' || persistedFilters.provider === 'Cohere' ? persistedFilters.provider : 'all',
    type: persistedFilters.type === 'content' || persistedFilters.type === 'research' || persistedFilters.type === 'product' ? persistedFilters.type : 'all',
    viewMode: layout === 'list' ? 'list' : 'grid',
    sortKey: sortKey,
    sortOrder: sortOrder,
  }
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(ProjectService.getProjects())
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filters, setFilters] = useState<ProjectFilters>(buildDefaultFilters)
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 200))
    setProjects(ProjectService.getProjects())
    setLoading(false)
  }

  const selectProject = (id: string | null) => {
    setSelectedProject(id ? ProjectService.getProject(id) ?? null : null)
  }

  const applyFilters = (updated: Partial<ProjectFilters>) => {
    setFilters((current) => {
      const next = { ...current, ...updated }
      WorkspacePreferencesService.setPageLayout('projects', next.viewMode)
      WorkspacePreferencesService.setSort('projects', `${next.sortKey}:${next.sortOrder}`)
      WorkspacePreferencesService.setFilters('projects', {
        query: next.query,
        status: next.status,
        provider: next.provider,
        type: next.type,
      })
      return next
    })
  }

  const createProject = (payload: ProjectCreatePayload) => {
    const project = ProjectService.createProject(payload)
    refresh()
    return project
  }

  const updateProject = (id: string, payload: ProjectUpdatePayload) => {
    const project = ProjectService.updateProject(id, payload)
    refresh()
    return project
  }

  const archiveProject = (id: string) => {
    const project = ProjectService.archiveProject(id)
    refresh()
    return project
  }

  const deleteProject = (id: string) => {
    ProjectService.deleteProject(id)
    refresh()
  }

  const duplicateProject = (id: string) => {
    const project = ProjectService.duplicateProject(id)
    refresh()
    return project
  }

  const favoriteProject = (id: string) => {
    const project = ProjectService.favoriteProject(id)
    refresh()
    return project
  }

  const value = useMemo(
    () => ({
      projects,
      selectedProject,
      loading,
      filters,
      refresh,
      selectProject,
      applyFilters,
      createProject,
      updateProject,
      archiveProject,
      deleteProject,
      duplicateProject,
      favoriteProject,
    }),
    [projects, selectedProject, loading, filters],
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjectContext must be used inside ProjectProvider')
  }
  return context
}
