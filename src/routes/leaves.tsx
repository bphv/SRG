import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/leaves')({
  component: LeavesPage,
})

function LeavesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Conges" description="Demandes de conges, validations et suivi des soldes." />
      <HumanResourcesWorkspace initialView="leaves" />
    </div>
  )
}
