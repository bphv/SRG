import { Link, createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import ConversationWorkspace from '#/app/components/conversation/ConversationWorkspace'
import WorkspaceSkeleton from '#/app/components/WorkspaceSkeleton'
import { useConversationWorkspace } from '#/app/hooks/useConversationWorkspace'
import { WorkflowWorkspaceService } from '#/app/services/WorkflowWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'

export const Route = createFileRoute('/chat')({
  component: ChatRoute,
})

function ChatRoute() {
  const { allConversations } = useConversationWorkspace()
  const workflow = WorkflowWorkspaceService.getDashboardSummary()
  const knowledge = KnowledgeWorkspaceService.getSummary()

  if (allConversations.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Workspace" description="Conversation, chat, agents, sessions and observability." />
        <WorkspaceSkeleton variant="dashboard" description="Loading conversation workspace." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI Workspace" description="Conversation, chat, agents, sessions and observability." />

      <Section title="Elements associes" description="Navigation contextuelle CRM vers Knowledge, Workflow, History et Observability.">
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">CRM</p>
            <p className="text-[var(--srg-text-muted)]">Conversations: {allConversations.length}</p>
            <p className="text-[var(--srg-text-muted)]">Knowledge docs: {knowledge.documents}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Workflow</p>
            <p className="text-[var(--srg-text-muted)]">Workflows: {workflow.totalWorkflows}</p>
            <p className="text-[var(--srg-text-muted)]">Failures: {workflow.failed}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/knowledge-center" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le document associe</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le workflow associe</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir les historiques associes</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Observability</Link>
        </div>
      </Section>

      <ConversationWorkspace />
    </div>
  )
}
