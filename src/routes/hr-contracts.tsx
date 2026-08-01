import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/hr-contracts')({
  component: HrContractsPage,
})

function HrContractsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contrats RH" description="Contrats, clauses, statuts et echeances du personnel." />
      <HumanResourcesWorkspace initialView="contracts" />
    </div>
  )
}
