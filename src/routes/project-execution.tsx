import { Link, createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import ProjectExecutionWorkspace from '#/app/components/project-execution/ProjectExecutionWorkspace'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'

export const Route = createFileRoute('/project-execution')({
  component: ProjectExecutionPage,
})

function ProjectExecutionPage() {
  const projects = ProjectExecutionWorkspaceService.getSummary()
  const finance = FinanceWorkspaceService.getSummary()
  const maintenance = MaintenanceWorkspaceService.getSummary()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Execution Workspace"
        description="Enterprise project execution and contract management from signature to closure"
      />

      <Section title="Elements associes" description="Liens Projects ↔ Finance ↔ Maintenance sans nouvelle logique metier.">
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Projects</p>
            <p className="text-[var(--srg-text-muted)]">Projets: {projects.projects}</p>
            <p className="text-[var(--srg-text-muted)]">Retards: {projects.delays}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Finance</p>
            <p className="text-[var(--srg-text-muted)]">Budget reel: {finance.budgetActual.toFixed(2)}</p>
            <p className="text-[var(--srg-text-muted)]">Variance: {finance.budgetVariance.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Maintenance</p>
            <p className="text-[var(--srg-text-muted)]">Interventions: {maintenance.workOrders}</p>
            <p className="text-[var(--srg-text-muted)]">Pannes: {maintenance.failures}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/finance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Finance</Link>
          <Link to="/maintenance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Maintenance</Link>
          <Link to="/procurement-inventory" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Procurement</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le workflow associe</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir les historiques associes</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Observability</Link>
        </div>
      </Section>

      <ProjectExecutionWorkspace />
    </div>
  )
}
