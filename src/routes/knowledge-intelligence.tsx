import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import Button from '#/app/components/ui/Button'
import { KnowledgeIntelligenceWorkspaceService } from '#/app/services/KnowledgeIntelligenceWorkspaceService'
import type {
  KnowledgeComparisonResult,
  KnowledgeIntelligenceDocument,
  KnowledgeQuestionResult,
} from '#/app/services/KnowledgeIntelligenceWorkspaceService'

export const Route = createFileRoute('/knowledge-intelligence')({
  component: KnowledgeIntelligencePage,
})

function KnowledgeIntelligencePage() {
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [question, setQuestion] = useState('Quels documents relient fournisseurs, equipements et chantiers sur 2022 ?')
  const [answer, setAnswer] = useState<KnowledgeQuestionResult | null>(null)
  const [leftDocumentId, setLeftDocumentId] = useState('')
  const [rightDocumentId, setRightDocumentId] = useState('')
  const [comparisonResult, setComparisonResult] = useState<KnowledgeComparisonResult | null>(null)

  const summary = useMemo(() => KnowledgeIntelligenceWorkspaceService.getDashboardSummary(), [tick])
  const documents = useMemo(() => KnowledgeIntelligenceWorkspaceService.getIntelligenceDocuments(), [tick])
  const graph = useMemo(() => KnowledgeIntelligenceWorkspaceService.buildDocumentGraph(), [tick])
  const observability = useMemo(() => KnowledgeIntelligenceWorkspaceService.getObservability(), [tick])
  const store = useMemo(() => KnowledgeIntelligenceWorkspaceService.getStore(), [tick])

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return documents

    return documents.filter((item) => {
      return `${item.title} ${item.type} ${item.category} ${item.themes.join(' ')} ${item.keywords.join(' ')} ${item.summary} ${item.project} ${item.supplier} ${item.equipment}`
        .toLowerCase()
        .includes(query)
    })
  }, [documents, search])

  const documentColumns: Array<DataTableColumn<KnowledgeIntelligenceDocument>> = [
    {
      key: 'title',
      label: 'Document',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <p className="font-semibold text-[var(--srg-text-title)]">{row.title}</p>
          <p className="text-xs text-[var(--srg-text-muted)]">{row.type} | {row.category} | {row.status}</p>
        </div>
      ),
    },
    { key: 'service', label: 'Service', sortable: true },
    { key: 'project', label: 'Project', sortable: true },
    { key: 'supplier', label: 'Supplier', sortable: true },
    { key: 'equipment', label: 'Equipment', sortable: true },
    { key: 'confidentiality', label: 'Confidentiality', sortable: true },
    { key: 'isCritical', label: 'Critical', sortable: true, render: (row) => (row.isCritical ? 'yes' : 'no') },
    { key: 'isExpired', label: 'Expired', sortable: true, render: (row) => (row.isExpired ? 'yes' : 'no') },
    { key: 'updatedAt', label: 'Updated', sortable: true, render: (row) => new Date(row.updatedAt).toLocaleString() },
  ]

  const questionColumns: Array<DataTableColumn<KnowledgeQuestionResult>> = [
    { key: 'question', label: 'Question', sortable: true },
    { key: 'confidence', label: 'Confidence', sortable: true, render: (row) => `${row.confidence}%` },
    { key: 'createdAt', label: 'Created', sortable: true, render: (row) => new Date(row.createdAt).toLocaleString() },
  ]

  const comparisonColumns: Array<DataTableColumn<KnowledgeComparisonResult>> = [
    { key: 'leftTitle', label: 'Left', sortable: true },
    { key: 'rightTitle', label: 'Right', sortable: true },
    { key: 'added', label: 'Added', render: (row) => row.added.length },
    { key: 'removed', label: 'Removed', render: (row) => row.removed.length },
    { key: 'modified', label: 'Modified', render: (row) => row.modified.length },
    { key: 'createdAt', label: 'Created', sortable: true, render: (row) => new Date(row.createdAt).toLocaleString() },
  ]

  const refresh = () => {
    KnowledgeIntelligenceWorkspaceService.refreshAndEmit()
    setTick((current) => current + 1)
  }

  const runQuestion = () => {
    const text = question.trim()
    if (!text) {
      setAnswer(null)
      return
    }

    const result = KnowledgeIntelligenceWorkspaceService.askDocumentsQuestion(text)
    setAnswer(result)
    setTick((current) => current + 1)
  }

  const compareDocuments = () => {
    if (!leftDocumentId || !rightDocumentId || leftDocumentId === rightDocumentId) {
      setComparisonResult(null)
      return
    }

    const result = KnowledgeIntelligenceWorkspaceService.compareDocuments(leftDocumentId, rightDocumentId)
    setComparisonResult(result)
    setTick((current) => current + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Intelligence" description="Enterprise document intelligence and reasoning with graph, comparison, timeline and observability." />

      <Section title="Quick Actions" description="Create, modify, export, share, history and search shortcuts.">
        <div className="flex flex-wrap gap-2">
          <Link to="/generate" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Créer</Link>
          <Link to="/knowledge-center" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Modifier</Link>
          <Button variant="secondary" size="sm" onClick={() => KnowledgeIntelligenceWorkspaceService.exportQuestionHistory()}>Exporter</Button>
          <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>Partager</Button>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Historique</Link>
          <Button variant="secondary" size="sm" onClick={() => setSearch('')}>Recherche</Button>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Observability</Link>
        </div>
      </Section>

      <Section title="Executive Summary" description="Knowledge-wide health, criticality, freshness and workflow linkage.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Documents</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.totalDocuments}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Recent 14d</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.recentDocuments}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Critical</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.criticalDocuments}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Expired</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.expiredDocuments}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Linked workflows</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.linkedToWorkflows}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Consulted docs</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.mostConsultedDocuments.length}</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={refresh}>Refresh Intelligence</Button>
          <Button variant="secondary" size="sm" onClick={() => KnowledgeIntelligenceWorkspaceService.exportQuestionHistory()}>Export Questions</Button>
          <Button variant="secondary" size="sm" onClick={() => KnowledgeIntelligenceWorkspaceService.exportComparisons()}>Export Comparisons</Button>
          <Button variant="secondary" size="sm" onClick={() => KnowledgeIntelligenceWorkspaceService.exportTimeline()}>Export Timeline</Button>
        </div>
      </Section>

      <Section title="Document Intelligence" description="Cross-document filtering, risk flags and confidentiality views.">
        <SearchBar
          value={search}
          onValueChange={setSearch}
          onSearch={setSearch}
          placeholder="Search document type, category, project, supplier, equipment, keywords"
          persistKey="knowledge-intelligence-documents"
        />
        <div className="mt-4">
          <DataTable
            tableId="knowledge-intelligence-documents-table"
            title="Document intelligence table"
            rows={filteredDocuments}
            columns={documentColumns}
            pageSize={10}
            exportFileName="srg-knowledge-intelligence-documents.csv"
          />
        </div>
      </Section>

      <Section title="Knowledge Graph" description="Document relations across project, equipment, supplier, employee and workflow links.">
        <div className="grid gap-4 lg:grid-cols-2 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Graph nodes ({graph.nodes.length})</p>
            <div className="mt-3 space-y-1 text-xs text-[var(--srg-text-muted)]">
              {graph.nodes.slice(0, 20).map((node) => <p key={node.id}>{node.type} | {node.label}</p>)}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Graph edges ({graph.edges.length})</p>
            <div className="mt-3 space-y-1 text-xs text-[var(--srg-text-muted)]">
              {graph.edges.slice(0, 24).map((edge) => <p key={edge.id}>{edge.relation} | {edge.from} {'->'} {edge.to}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Document Q&A" description="Semantic questions with source snippets, confidence and traceability.">
        <div className="grid gap-3 text-sm">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a knowledge question"
            className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={runQuestion}>Run Question</Button>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm text-[var(--srg-text-muted)]">
            {answer ? (
              <>
                <p className="font-semibold text-[var(--srg-text-title)]">Answer</p>
                <p className="mt-2">{answer.answer}</p>
                <p className="mt-2 text-xs">Confidence: {answer.confidence}%</p>
                <div className="mt-3 space-y-2 text-xs">
                  {answer.sources.map((source) => (
                    <div key={`${source.documentId}-${source.title}`} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-2">
                      <p className="font-semibold text-[var(--srg-text-title)]">{source.title}</p>
                      <p>{source.author} | {new Date(source.date).toLocaleDateString()}</p>
                      {source.paragraphs.slice(0, 2).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Run a question to get an explainable answer with sources.</p>
            )}
          </div>
          <DataTable
            tableId="knowledge-intelligence-question-history"
            title="Question history"
            rows={store.questionHistory}
            columns={questionColumns}
            pageSize={8}
            exportFileName="srg-knowledge-intelligence-question-history.csv"
          />
        </div>
      </Section>

      <Section title="Document Comparison" description="Compare two documents and inspect added, removed and modified statements.">
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <select value={leftDocumentId} onChange={(event) => setLeftDocumentId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="">Select left document</option>
            {documents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <select value={rightDocumentId} onChange={(event) => setRightDocumentId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="">Select right document</option>
            {documents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={compareDocuments}>Compare</Button>
        </div>
        <div className="mt-3 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-xs text-[var(--srg-text-muted)]">
          {comparisonResult ? (
            <>
              <p className="font-semibold text-[var(--srg-text-title)]">{comparisonResult.leftTitle} {'<>'} {comparisonResult.rightTitle}</p>
              <p className="mt-2">Added: {comparisonResult.added.length} | Removed: {comparisonResult.removed.length} | Modified: {comparisonResult.modified.length}</p>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                <div>
                  <p className="font-semibold text-[var(--srg-text-title)]">Added</p>
                  {comparisonResult.added.slice(0, 8).map((line, index) => <p key={index}>{line}</p>)}
                </div>
                <div>
                  <p className="font-semibold text-[var(--srg-text-title)]">Removed</p>
                  {comparisonResult.removed.slice(0, 8).map((line, index) => <p key={index}>{line}</p>)}
                </div>
                <div>
                  <p className="font-semibold text-[var(--srg-text-title)]">Modified</p>
                  {comparisonResult.modified.slice(0, 8).map((line, index) => <p key={index}>{line}</p>)}
                </div>
              </div>
            </>
          ) : (
            <p>Select two different documents and run comparison.</p>
          )}
        </div>
        <div className="mt-3">
          <DataTable
            tableId="knowledge-intelligence-comparison-history"
            title="Comparison history"
            rows={store.comparisons}
            columns={comparisonColumns}
            pageSize={8}
            exportFileName="srg-knowledge-intelligence-comparisons.csv"
          />
        </div>
      </Section>

      <Section title="Timeline & Observability" description="Knowledge events, metrics, queries and timeline updates.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Knowledge events</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.knowledgeEvents.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Metric snapshots</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.knowledgeMetrics.snapshots}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Document queries</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.documentQueries.total}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Timeline items</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.knowledgeTimeline.length}</p></div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent events</p>
            {observability.knowledgeEvents.slice(0, 16).map((item) => <p key={item.id}>{item.type} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Timeline</p>
            {observability.knowledgeTimeline.slice(0, 16).map((item) => <p key={item.id}>{item.type} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
          </div>
        </div>
      </Section>
    </div>
  )
}
