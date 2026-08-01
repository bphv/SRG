import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import AgentWorkspace from '#/app/components/agents/AgentWorkspace'

export const Route = createFileRoute('/agents')({
  component: AgentsRoute,
})

function AgentsRoute() {
  return (
    <div className="space-y-6">
      <PageHeader title="AI Agents Workspace" description="Build, automate and observe no-code AI agents in one workspace." />
      <AgentWorkspace />
    </div>
  )
}
