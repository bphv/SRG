import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import KnowledgeWorkspace from '#/app/components/knowledge/KnowledgeWorkspace'

export const Route = createFileRoute('/knowledge-center')({
  component: KnowledgeCenterPage,
})

function KnowledgeCenterPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Workspace & RAG Center" description="Shared document memory with import, indexing, advanced search, RAG context and observability." />
      <KnowledgeWorkspace />
    </div>
  )
}
