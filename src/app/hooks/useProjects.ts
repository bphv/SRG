import { useProjectContext } from '#/app/contexts/ProjectContext'

export function useProjects() {
  return useProjectContext()
}
