import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import FinanceWorkspace from '#/app/components/finance/FinanceWorkspace'

export const Route = createFileRoute('/finance')({
  component: FinancePage,
})

function FinancePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Finance Workspace" description="Enterprise Accounting, Finance and Management Control." />
      <FinanceWorkspace initialView="overview" />
    </div>
  )
}
