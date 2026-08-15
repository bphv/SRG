import { Link, createFileRoute } from '@tanstack/react-router'
import NavigationArrows from '#/app/components/NavigationArrows'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'
import { HumanResourcesWorkspaceService } from '#/app/services/HumanResourcesWorkspaceService'

export const Route = createFileRoute('/payroll')({
  component: PayrollPage,
})

function PayrollPage() {
  const hr = HumanResourcesWorkspaceService.getSummary()

  return (
    <div className="space-y-6">
      <NavigationArrows backTo="/categories" backLabel="Categories" nextTo="/attendance" nextLabel="Pointage" />
      <PageHeader title="Paie" description="Preparation, validation, reglement et controle de la paie." />

      <Section title="Synthese paie" description="Indicateurs cles du module paie RH.">
        <div className="grid gap-3 md:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Bulletins</p>
            <p className="text-[var(--srg-text-muted)]">{hr.payrollRecords}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Paie nette totale</p>
            <p className="text-[var(--srg-text-muted)]">{hr.payrollTotal.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Paie nette moyenne</p>
            <p className="text-[var(--srg-text-muted)]">{hr.avgNetPayroll.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Employes actifs</p>
            <p className="text-[var(--srg-text-muted)]">{hr.activeEmployees}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/human-resources" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le workspace RH complet</Link>
          <Link to="/attendance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Presences et pointage</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Historique associe</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Observability</Link>
        </div>
      </Section>

      <HumanResourcesWorkspace initialView="payroll" />
    </div>
  )
}