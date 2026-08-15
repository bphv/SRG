import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/attendance')({
  component: AttendancePage,
})

function AttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Presences" description="Pointages, absences, heures supplementaires et suivi terrain." />
      <HumanResourcesWorkspace initialView="attendance" />
    </div>
  )
}
