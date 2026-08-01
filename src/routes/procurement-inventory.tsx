import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import ProcurementInventoryWorkspace from '#/app/components/procurement/ProcurementInventoryWorkspace'

export const Route = createFileRoute('/procurement-inventory')({
  component: ProcurementInventoryPage,
})

function ProcurementInventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Procurement & Inventory Workspace"
        description="Industrial purchasing, tenders, suppliers, orders, stocks, receptions and logistics end-to-end"
      />
      <ProcurementInventoryWorkspace />
    </div>
  )
}
