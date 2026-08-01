import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import ProjectExecutionWorkspace from '#/app/components/project-execution/ProjectExecutionWorkspace'

export const Route = createFileRoute('/project-execution')({
  component: ProjectExecutionPage,
})

function ProjectExecutionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Execution Workspace"
        description="Enterprise project execution and contract management from signature to closure"
      />
      <ProjectExecutionWorkspace />
    </div>
  )
}
