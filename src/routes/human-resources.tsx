import { Link, createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'
import { HumanResourcesWorkspaceService } from '#/app/services/HumanResourcesWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { WorkflowWorkspaceService } from '#/app/services/WorkflowWorkspaceService'

export const Route = createFileRoute('/human-resources')({
  component: HumanResourcesPage,
})

function HumanResourcesPage() {
  const hr = HumanResourcesWorkspaceService.getSummary()
  const projects = ProjectExecutionWorkspaceService.getSummary()
  const workflow = WorkflowWorkspaceService.getDashboardSummary()

  return (
    <div className="space-y-6">
      <PageHeader title="Ressources Humaines" description="SRG enterprise HR, payroll and workforce management workspace." />

      <Section title="Elements associes" description="Liens RH, Projets, Workflow, History et Observability.">
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">RH</p>
            <p className="text-[var(--srg-text-muted)]">Employes: {hr.employees}</p>
            <p className="text-[var(--srg-text-muted)]">Conges: {hr.leaveRequests}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Projects</p>
            <p className="text-[var(--srg-text-muted)]">Equipes: {projects.teams}</p>
            <p className="text-[var(--srg-text-muted)]">Presences: {projects.attendance}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Workflow</p>
            <p className="text-[var(--srg-text-muted)]">Workflows: {workflow.totalWorkflows}</p>
            <p className="text-[var(--srg-text-muted)]">Succes: {workflow.successRate}%</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/project-execution" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Projects</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le workflow associe</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir les historiques associes</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Observability</Link>
        </div>
      </Section>

      <HumanResourcesWorkspace initialView="overview" />
    </div>
  )
}
