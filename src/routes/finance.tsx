import { Link, createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import FinanceWorkspace from '#/app/components/finance/FinanceWorkspace'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'

export const Route = createFileRoute('/finance')({
  component: FinancePage,
})

function FinancePage() {
  const finance = FinanceWorkspaceService.getSummary()
  const procurement = ProcurementInventoryWorkspaceService.getSummary()
  const projects = ProjectExecutionWorkspaceService.getSummary()

  return (
    <div className="space-y-6">
      <PageHeader title="Finance Workspace" description="Enterprise Accounting, Finance and Management Control." />

      <Section title="Elements associes" description="Liens Finance ↔ Procurement ↔ Projects sans recalcul metier.">
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Finance</p>
            <p className="text-[var(--srg-text-muted)]">Factures fournisseurs: {finance.supplierInvoices}</p>
            <p className="text-[var(--srg-text-muted)]">Cash flow: {finance.cashFlow.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Procurement</p>
            <p className="text-[var(--srg-text-muted)]">Commandes: {procurement.orders}</p>
            <p className="text-[var(--srg-text-muted)]">Valeur commandes: {procurement.orderValue.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Projects</p>
            <p className="text-[var(--srg-text-muted)]">Projets: {projects.projects}</p>
            <p className="text-[var(--srg-text-muted)]">Budget total: {projects.totalBudget.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/procurement-inventory" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Procurement</Link>
          <Link to="/project-execution" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Projects</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le workflow associe</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir les historiques associes</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Observability</Link>
        </div>
      </Section>

      <FinanceWorkspace initialView="overview" />
    </div>
  )
}
