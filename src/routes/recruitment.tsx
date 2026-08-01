import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/recruitment')({
  component: RecruitmentPage,
})

function RecruitmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Recrutement" description="Pipeline candidats, embauches et besoins en effectifs." />
      <HumanResourcesWorkspace initialView="recruitment" />
    </div>
  )
}
