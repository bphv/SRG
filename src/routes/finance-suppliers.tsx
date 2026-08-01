import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import FinanceWorkspace from '#/app/components/finance/FinanceWorkspace'

export const Route = createFileRoute('/finance-suppliers')({
  component: FinanceSuppliersPage,
})

function FinanceSuppliersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Comptabilite Fournisseurs" description="Factures fournisseurs, paiements, retenues et suivi des echeances." />
      <FinanceWorkspace initialView="suppliers" />
    </div>
  )
}
