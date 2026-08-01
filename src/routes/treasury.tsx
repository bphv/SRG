import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import FinanceWorkspace from '#/app/components/finance/FinanceWorkspace'

export const Route = createFileRoute('/treasury')({
  component: TreasuryPage,
})

function TreasuryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tresorerie" description="Banques, caisses, comptes, virements et rapprochements." />
      <FinanceWorkspace initialView="treasury" />
    </div>
  )
}
