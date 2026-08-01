import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/evaluations')({
  component: EvaluationsPage,
})

function EvaluationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Evaluations" description="Performance, potentiel et plans d evolution." />
      <HumanResourcesWorkspace initialView="evaluations" />
    </div>
  )
}
