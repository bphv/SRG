import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import BusinessPolicyWorkspace from '#/app/components/business/BusinessPolicyWorkspace'

export const Route = createFileRoute('/business-policy')({
  component: BusinessPolicyPage,
})

function BusinessPolicyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Policy Workspace"
        description="Enterprise business policy and commercial intelligence engine"
      />
      <BusinessPolicyWorkspace />
    </div>
  )
}
