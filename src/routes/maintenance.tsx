import { Link, createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import MaintenanceWorkspace from '#/app/components/maintenance/MaintenanceWorkspace'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'

export const Route = createFileRoute('/maintenance')({
  component: MaintenancePage,
})

function MaintenancePage() {
  const maintenance = MaintenanceWorkspaceService.getSummary()
  const projects = ProjectExecutionWorkspaceService.getSummary()
  const knowledge = KnowledgeWorkspaceService.getSummary()

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance Workspace" description="Enterprise maintenance, CMMS workflows, equipment and interventions." />

      <Section title="Elements associes" description="Liens Maintenance ↔ Projects ↔ Knowledge bases sur les donnees existantes.">
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Maintenance</p>
            <p className="text-[var(--srg-text-muted)]">Equipements: {maintenance.equipments}</p>
            <p className="text-[var(--srg-text-muted)]">Interventions: {maintenance.workOrders}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Projects</p>
            <p className="text-[var(--srg-text-muted)]">Projets actifs: {projects.projects}</p>
            <p className="text-[var(--srg-text-muted)]">Retards: {projects.delays}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Knowledge</p>
            <p className="text-[var(--srg-text-muted)]">Documents: {knowledge.documents}</p>
            <p className="text-[var(--srg-text-muted)]">Indexations: {knowledge.indexations}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/project-execution" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Projects</Link>
          <Link to="/knowledge-center" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le document associe</Link>
          <Link to="/knowledge-intelligence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Knowledge</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le workflow associe</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir les historiques associes</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Observability</Link>
        </div>
      </Section>

      <MaintenanceWorkspace />
    </div>
  )
}
