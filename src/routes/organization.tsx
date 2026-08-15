import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/organization')({
  component: OrganizationPage,
})

function OrganizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Organisation" description="Structure organisationnelle, unites, management et capacites." />
      <HumanResourcesWorkspace initialView="organization" />
    </div>
  )
}
