import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/human-resources')({
  component: HumanResourcesPage,
})

function HumanResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Ressources Humaines" description="SRG enterprise HR, payroll and workforce management workspace." />
      <HumanResourcesWorkspace initialView="overview" />
    </div>
  )
}
