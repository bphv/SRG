import { createFileRoute } from '@tanstack/react-router'
import MaintenanceWorkspace from '#/app/components/maintenance/MaintenanceWorkspace'

export const Route = createFileRoute('/maintenance')({
  component: MaintenancePage,
})

function MaintenancePage() {
  return <MaintenanceWorkspace />
}
