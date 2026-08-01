import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import FinanceWorkspace from '#/app/components/finance/FinanceWorkspace'

export const Route = createFileRoute('/accounting')({
  component: AccountingPage,
})

function AccountingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Comptabilite" description="Comptabilite generale, clients et fournisseurs." />
      <FinanceWorkspace initialView="accounting" />
    </div>
  )
}
