import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import UniversalFilter from '#/app/components/UniversalFilter'
import ProcurementInventoryWorkspace from '#/app/components/procurement/ProcurementInventoryWorkspace'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'

export const Route = createFileRoute('/procurement-inventory')({
  component: ProcurementInventoryPage,
})

const PROCUREMENT_SUGGESTIONS = [
  'purchasing',
  'tenders',
  'suppliers',
  'orders',
  'stocks',
  'receptions',
  'logistics',
]

function ProcurementInventoryPage() {
  const procurement = ProcurementInventoryWorkspaceService.getSummary()
  const finance = FinanceWorkspaceService.getSummary()
  const projects = ProjectExecutionWorkspaceService.getSummary()
  const [filterQuery, setFilterQuery] = useState('')

  const matchedItems = useMemo(() => {
    const normalized = filterQuery.trim().toLowerCase()
    if (!normalized) return PROCUREMENT_SUGGESTIONS
    return PROCUREMENT_SUGGESTIONS.filter((item) => item.toLowerCase().includes(normalized))
  }, [filterQuery])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Procurement & Inventory Workspace"
        description="Industrial purchasing, tenders, suppliers, orders, stocks, receptions and logistics end-to-end"
      />

      {/* Filtre universel : filtre local du contenu Procurement, contexte page preserve */}
      <UniversalFilter
        persistKey="route-procurement-inventory"
        placeholder="Filtrer le contenu Procurement (suppliers, orders, stocks...)"
        ariaLabel="Filtre du contenu Procurement"
        value={filterQuery}
        onValueChange={setFilterQuery}
        suggestions={PROCUREMENT_SUGGESTIONS}
        resultCountLabel={`${matchedItems.length} element${matchedItems.length > 1 ? 's' : ''} correspondant${matchedItems.length > 1 ? 's' : ''}`}
      />

      <Section title="Elements associes" description="Liens Procurement ↔ Finance ↔ Projects a partir des donnees existantes.">
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Suppliers</p>
            <p className="text-[var(--srg-text-muted)]">Fournisseurs: {procurement.suppliers}</p>
            <p className="text-[var(--srg-text-muted)]">Top fournisseur: {procurement.topSuppliers[0]?.name ?? 'n/a'}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Finance linkage</p>
            <p className="text-[var(--srg-text-muted)]">Factures fournisseurs: {finance.supplierInvoices}</p>
            <p className="text-[var(--srg-text-muted)]">Echeances en retard: {finance.supplierOverdue}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Projects linkage</p>
            <p className="text-[var(--srg-text-muted)]">Achats projets: {projects.purchases}</p>
            <p className="text-[var(--srg-text-muted)]">Retards projets: {projects.delays}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/finance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Finance</Link>
          <Link to="/project-execution" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Projects</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le workflow associe</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir les historiques associes</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Observability</Link>
        </div>
      </Section>

      <ProcurementInventoryWorkspace />
    </div>
  )
}
