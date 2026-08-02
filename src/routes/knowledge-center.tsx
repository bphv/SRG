import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import KnowledgeWorkspace from '#/app/components/knowledge/KnowledgeWorkspace'

export const Route = createFileRoute('/knowledge-center')({
  component: KnowledgeCenterPage,
})

function KnowledgeCenterPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Enterprise Archive Center" description="Préparation documentaire enterprise avec archives, collections, prévisualisation et readiness UI avant moteurs OCR ou RAG." />
      <KnowledgeWorkspace />
    </div>
  )
}
