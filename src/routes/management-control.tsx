import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import FinanceWorkspace from '#/app/components/finance/FinanceWorkspace'

export const Route = createFileRoute('/management-control')({
  component: ManagementControlPage,
})

function ManagementControlPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Controle de gestion" description="Centres de couts, budgets, variances, rentabilite et pilotage financier." />
      <FinanceWorkspace initialView="management-control" />
    </div>
  )
}
