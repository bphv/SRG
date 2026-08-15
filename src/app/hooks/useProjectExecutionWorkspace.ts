import { useMemo, useState } from 'react'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export function useProjectExecutionWorkspace() {
  const [tick, setTick] = useState(0)
  const preferences = WorkspacePreferencesService.getPreferences()
  const persisted = preferences.filters['project-execution-workspace'] ?? {}

  const [selectedProjectId, setSelectedProjectIdState] = useState(typeof persisted.selectedProjectId === 'string' ? persisted.selectedProjectId : '')

  const refresh = () => setTick((value) => value + 1)

  const setSelectedProjectId = (projectId: string) => {
    setSelectedProjectIdState(projectId)
    WorkspacePreferencesService.setFilters('project-execution-workspace', {
      ...persisted,
      selectedProjectId: projectId,
    })
  }

  const store = useMemo(() => ProjectExecutionWorkspaceService.getStore(), [tick])
  const summary = useMemo(() => ProjectExecutionWorkspaceService.getSummary(), [tick])
  const selectedProject = useMemo(
    () => store.projects.find((item) => item.id === selectedProjectId) ?? store.projects[0],
    [store.projects, selectedProjectId],
  )

  return {
    store,
    summary,
    selectedProject,
    selectedProjectId: selectedProject.id,
    setSelectedProjectId,
    refresh,
    statuses: ProjectExecutionWorkspaceService.listStatuses(),
    priorities: ProjectExecutionWorkspaceService.listPriorities(),
    workItemTypes: ProjectExecutionWorkspaceService.listWorkItemTypes(),
    planningKinds: ProjectExecutionWorkspaceService.listPlanningKinds(),
    materialCategories: ProjectExecutionWorkspaceService.listMaterialCategories(),
  }
}
