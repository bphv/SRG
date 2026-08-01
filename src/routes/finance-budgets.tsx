import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import FinanceWorkspace from '#/app/components/finance/FinanceWorkspace'

export const Route = createFileRoute('/finance-budgets')({
  component: FinanceBudgetsPage,
})

function FinanceBudgetsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Budgets" description="Budgets, previsions, realise, ecarts, revisions et simulations." />
      <FinanceWorkspace initialView="budgets" />
    </div>
  )
}
