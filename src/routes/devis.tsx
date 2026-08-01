import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import DevisWorkspace from '#/app/components/business/DevisWorkspace'

export const Route = createFileRoute('/devis')({
  component: DevisPage,
})

function DevisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Devis Workspace"
        description="Quotes and unified billing document engine"
      />
      <DevisWorkspace />
    </div>
  )
}
