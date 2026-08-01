import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/employees')({
  component: EmployeesPage,
})

function EmployeesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Employes" description="Dossiers employes, roles, affectations et cycle de vie RH." />
      <HumanResourcesWorkspace initialView="employees" />
    </div>
  )
}
