import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import FinanceWorkspace from '#/app/components/finance/FinanceWorkspace'

export const Route = createFileRoute('/finance-customers')({
  component: FinanceCustomersPage,
})

function FinanceCustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Comptabilite Clients" description="Factures, encaissements, echeances, relances et soldes clients." />
      <FinanceWorkspace initialView="customers" />
    </div>
  )
}
