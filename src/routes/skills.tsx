import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/skills')({
  component: SkillsPage,
})

function SkillsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Competences" description="Matrice de competences, certifications et plans de progression." />
      <HumanResourcesWorkspace initialView="skills" />
    </div>
  )
}
