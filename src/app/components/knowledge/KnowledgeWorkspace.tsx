import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import EmptyState from '#/app/components/EmptyState'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useKnowledgeWorkspace } from '#/app/hooks/useKnowledgeWorkspace'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import type { KnowledgeDocumentRecord, KnowledgeExportType, KnowledgeImportType, KnowledgeEnterpriseSearchFilters } from '#/app/services/KnowledgeWorkspaceService'

function sparkline(values: number[]): string {
  const blocks = ['_', '.', '-', '=', '*', '#']
  const max = Math.max(1, ...values)
  return values.slice(0, 16).map((value) => blocks[Math.min(blocks.length - 1, Math.floor((value / max) * (blocks.length - 1)))]).join('')
}

function byId(list: KnowledgeDocumentRecord[], id: string | null): KnowledgeDocumentRecord | undefined {
  if (!id) return undefined
  return list.find((item) => item.id === id)
}

export default function KnowledgeWorkspace() {
  const business = useBusiness()
  const {
    store,
    summary,
    filters,
    setFilters,
    enterpriseFilters,
    setEnterpriseFilters,
    documents,
    enterpriseDocuments,
    graph,
    ocrQueue,
    decompressions,
    aiAnswers,
    suggestions,
    similarDocuments,
    categories,
    tags,
    authors,
    selectedByIds,
    refresh,
  } = useKnowledgeWorkspace()
  const currentSession = business.currentSession
  const actorName = currentSession
    ? business.snapshot.users.find((user) => user.id === currentSession.userId)?.username ?? 'System'
    : business.snapshot.users.at(0)?.username ?? 'System'

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(documents.at(0)?.id ?? null)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [commentInput, setCommentInput] = useState('')
  const [versionLabel, setVersionLabel] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [importText, setImportText] = useState('')
  const [importTitle, setImportTitle] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [githubInput, setGithubInput] = useState('')
  const [ragChunkCount, setRagChunkCount] = useState(4)
  const [ragCollectionId, setRagCollectionId] = useState<string>('all')
  const [ragCategory, setRagCategory] = useState<string>('all')
  const [ragPreview, setRagPreview] = useState('')
  const [archiveName, setArchiveName] = useState('enterprise-archive')
  const [ocrLanguage, setOcrLanguage] = useState('fr')
  const [reportTitle, setReportTitle] = useState('EDI enterprise report')
  const [aiQuestion, setAiQuestion] = useState('Quels sont les moteurs ABB installes sur le chantier Razel en 2022 avec references et montants ?')
  const [aiPreview, setAiPreview] = useState('')

  const selected = useMemo(() => byId(store.documents, selectedDocumentId) ?? documents.at(0), [store.documents, documents, selectedDocumentId])
  const checkedDocuments = useMemo(() => selectedByIds(selectedDocumentIds), [selectedDocumentIds, selectedByIds])
  const importHistory = summary.importHistory.slice(0, 10)
  const searchHistory = summary.searchHistory.slice(0, 10)
  const exportHistory = summary.exportHistory.slice(0, 10)

  const updateEnterpriseFilters = (patch: Partial<KnowledgeEnterpriseSearchFilters>) => {
    setEnterpriseFilters({ ...enterpriseFilters, ...patch })
  }

  const toggleSelectedForRag = (id: string, checked: boolean) => {
    setSelectedDocumentIds((current) => (
      checked ? Array.from(new Set([...current, id])) : current.filter((value) => value !== id)
    ))
  }

  const runTextImport = (type: KnowledgeImportType) => {
    KnowledgeWorkspaceService.importTextAsType(importText, importTitle, type, actorName)
    setImportText('')
    setImportTitle('')
    refresh()
  }

  const runRagPreview = () => {
    const result = KnowledgeWorkspaceService.buildRagContext({
      documentIds: selectedDocumentIds,
      collectionIds: ragCollectionId === 'all' ? [] : [ragCollectionId],
      categories: ragCategory === 'all' ? [] : [ragCategory],
      chunkCount: ragChunkCount,
    })
    setRagPreview(result.contextPreview)
    refresh()
  }

  const exportSelection = async (format: KnowledgeExportType) => {
    await KnowledgeWorkspaceService.exportDocuments(format, selectedDocumentIds.length > 0 ? selectedDocumentIds : documents.slice(0, 10).map((item) => item.id))
    refresh()
  }

  const exportEnterprise = async (format: 'pdf' | 'word' | 'excel' | 'csv' | 'markdown' | 'json' | 'printable') => {
    const ids = selectedDocumentIds.length > 0 ? selectedDocumentIds : enterpriseDocuments.slice(0, 12).map((item) => item.id)
    await KnowledgeWorkspaceService.exportEnterpriseReport(format, reportTitle, ids)
    refresh()
  }

  const runEnterpriseAi = () => {
    const answer = KnowledgeWorkspaceService.answerEnterpriseQuestion(aiQuestion)
    setAiPreview(`${answer.answerText}\n\nConfidence: ${answer.confidenceScore}\nSources: ${answer.sources.map((item) => item.title).join(' | ') || 'n/a'}`)
    refresh()
  }

  return (
    <div className="space-y-6">
      <Section title="Knowledge Workspace" description="Shared documentation memory for all SRG workspaces.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Documents</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.documents}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Collections</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.collections}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Imports</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.imports}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Indexed</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.indexations}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Favorites</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.favorites}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Volume</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.volume}</p></div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Decompressions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.edi.decompressions}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">OCR queued</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.edi.ocrQueued}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">OCR completed</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.edi.ocrCompleted}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">AI answers</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.edi.enterpriseAnswers}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Reports</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.edi.reports}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Graph nodes</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{graph.nodes.length}</p></div>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.42fr]">
        <section className="space-y-4 rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
          <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Document Library</h3>
          <div className="grid gap-2">
            <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Global/full-text search" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
            <div className="grid gap-2 sm:grid-cols-2">
              <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">
                <option value="all">all categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value as typeof filters.type })} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">
                {['all', 'markdown', 'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'json', 'xml', 'html', 'image', 'audio', 'video', 'email-export', 'technical-plan', 'scan', 'invoice', 'delivery-note', 'receipt-note', 'photo', 'report', 'web-link', 'note', 'faq', 'guide', 'documentation'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as typeof filters.status })} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">
                {['all', 'draft', 'validated', 'archived', 'trash'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as typeof filters.sort })} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">
                <option value="updatedAt:desc">updated desc</option>
                <option value="updatedAt:asc">updated asc</option>
                <option value="title:asc">title asc</option>
                <option value="title:desc">title desc</option>
                <option value="score:desc">score desc</option>
              </select>
              <input value={filters.tag} onChange={(event) => setFilters({ ...filters, tag: event.target.value })} placeholder="Tag search" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
              <input value={filters.author} onChange={(event) => setFilters({ ...filters, author: event.target.value })} placeholder="Author" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" list="knowledge-authors" />
              <input value={filters.date} type="date" onChange={(event) => setFilters({ ...filters, date: event.target.value })} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
              <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">
                <input type="checkbox" checked={filters.favoritesOnly} onChange={(event) => setFilters({ ...filters, favoritesOnly: event.target.checked })} /> favorites only
              </label>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">
                <input type="checkbox" checked={filters.semanticUi} onChange={(event) => setFilters({ ...filters, semanticUi: event.target.checked })} /> semantic search (UI)
              </label>
            </div>
            <datalist id="knowledge-authors">
              {authors.map((author) => <option key={author} value={author} />)}
            </datalist>
            {suggestions.length > 0 ? <p className="text-xs text-[var(--srg-text-muted)]">Suggestions: {suggestions.join(' | ')}</p> : null}
          </div>

          <div className="space-y-2 text-sm">
            {documents.length === 0 ? (
              <EmptyState eyebrow="Knowledge" illustration={<span aria-hidden>docs</span>} title="No document" description="Import or create knowledge documents." />
            ) : null}
            {documents.map((document) => (
              <article key={document.id} className={`rounded-2xl border p-3 ${selected?.id === document.id ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-surface)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <button type="button" onClick={() => setSelectedDocumentId(document.id)} className="text-left">
                    <p className="font-semibold text-[var(--srg-text-title)]">{document.title}</p>
                    <p className="text-xs text-[var(--srg-text-muted)]">{document.documentType} | {document.category} | {document.status}</p>
                  </button>
                  <label className="inline-flex items-center gap-1 text-xs text-[var(--srg-text-muted)]">
                    <input type="checkbox" checked={selectedDocumentIds.includes(document.id)} onChange={(event) => toggleSelectedForRag(document.id, event.target.checked)} /> RAG
                  </label>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-[var(--srg-text-muted)]">{document.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.toggleFavorite(document.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">{document.favorite ? 'Unfavorite' : 'Favorite'}</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.reindexDocument(document.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">Index</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.enqueueOcr(document.id, ocrLanguage); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">Queue OCR</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.runOcr(document.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">Run OCR</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.autoExtractAndClassify(document.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">Extract/Classify</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.setStatus(document.id, 'validated'); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">Validate</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.setStatus(document.id, 'archived'); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">Archive</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.setStatus(document.id, 'trash'); refresh() }} className="rounded-xl border border-[rgba(223,78,78,0.24)] px-2 py-1 text-xs text-[#9b2f2f]">Trash</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {!selected ? (
            <EmptyState eyebrow="Document" illustration={<span aria-hidden>open</span>} title="Select a document" description="Select one document from library." />
          ) : (
            <>
              <Section title={selected.title} description="Metadata, indexing, versions, comments and lifecycle.">
                <div className="grid gap-3 text-sm lg:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Index status</p>
                    <p className="mt-1 text-[var(--srg-text-title)]">{selected.index.status} | chunks {selected.index.chunks} | score {selected.index.metadata.score}</p>
                    <p className="text-[var(--srg-text-muted)]">lang {selected.index.metadata.language} | size {selected.index.metadata.size} | hash {selected.index.metadata.hash}</p>
                    <p className="mt-2 text-xs text-[var(--srg-text-muted)]">keywords: {selected.index.metadata.keywords.join(', ') || 'n/a'}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Source</p>
                    <p className="mt-1 text-[var(--srg-text-title)]">{selected.source}</p>
                    <p className="text-[var(--srg-text-muted)]">author {selected.index.metadata.author}</p>
                    <p className="text-[var(--srg-text-muted)]">version {selected.index.metadata.version}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 text-xs lg:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-[var(--srg-text-muted)]">
                    <p className="font-semibold text-[var(--srg-text-title)]">OCR</p>
                    <p>Status: {selected.ocr.status}</p>
                    <p>Progress: {selected.ocr.progress}%</p>
                    <p>Lang: {selected.ocr.language}</p>
                    <p>Confidence: {selected.ocr.confidence}</p>
                    <p className="mt-1">{selected.ocr.diagnostics}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-[var(--srg-text-muted)]">
                    <p className="font-semibold text-[var(--srg-text-title)]">Extraction</p>
                    <p>Entreprise: {selected.extraction.entreprise || 'n/a'}</p>
                    <p>Fournisseur: {selected.extraction.fournisseur || 'n/a'}</p>
                    <p>Equipement: {selected.extraction.equipement || 'n/a'}</p>
                    <p>Puissance: {selected.extraction.puissanceKw || 0} KW</p>
                    <p>RPM: {selected.extraction.rpm || 0}</p>
                    <p>Serie: {selected.extraction.numeroSerie || 'n/a'}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-[var(--srg-text-muted)]">
                    <p className="font-semibold text-[var(--srg-text-title)]">Classification</p>
                    <p>Category: {selected.classification.category}</p>
                    <p>Sous categorie: {selected.classification.subCategory}</p>
                    <p>Projet: {selected.classification.projet || 'n/a'}</p>
                    <p>Chantier: {selected.classification.chantier || 'n/a'}</p>
                    <p>Annee: {selected.classification.annee || 'n/a'}</p>
                    <p>Famille: {selected.classification.famille || 'n/a'}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="add tag" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" list="knowledge-tags" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.addTag(selected.id, tagInput); setTagInput(''); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Add Tag</button>
                  <input value={versionLabel} onChange={(event) => setVersionLabel(event.target.value)} placeholder="version label" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.createVersion(selected.id, versionLabel); setVersionLabel(''); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Create Version</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.setStatus(selected.id, 'draft'); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Restore Draft</button>
                </div>
                <datalist id="knowledge-tags">
                  {tags.map((tag) => <option key={tag} value={tag} />)}
                </datalist>

                <div className="mt-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-sm text-[var(--srg-text-title)]">
                  <p className="font-semibold">Summary</p>
                  <p className="mt-1 text-[var(--srg-text-muted)]">{selected.index.metadata.summary}</p>
                  <pre className="mt-3 whitespace-pre-wrap text-xs text-[var(--srg-text-muted)]">{selected.content.slice(0, 1600)}</pre>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2 text-xs text-[var(--srg-text-muted)]">
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
                    <p className="font-semibold text-[var(--srg-text-title)]">Versions</p>
                    {selected.versions.slice(0, 8).map((version) => <p key={version.id}>{version.label} | {new Date(version.createdAt).toLocaleString()}</p>)}
                  </div>
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
                    <p className="font-semibold text-[var(--srg-text-title)]">Comments</p>
                    {selected.comments.slice(0, 8).map((item) => <p key={item.id}>{item.author}: {item.message}</p>)}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <input value={commentInput} onChange={(event) => setCommentInput(event.target.value)} placeholder="Add comment" className="flex-1 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.addComment(selected.id, actorName, commentInput); setCommentInput(''); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Comment</button>
                </div>
              </Section>

              <Section title="Collections & Import" description="Import local/multiple/drag-drop/zip/url/github and format-specific imports.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <input value={newCollectionName} onChange={(event) => setNewCollectionName(event.target.value)} placeholder="Collection name" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <input value={newCollectionDescription} onChange={(event) => setNewCollectionDescription(event.target.value)} placeholder="Collection description" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.createCollection(newCollectionName, newCollectionDescription); setNewCollectionName(''); setNewCollectionDescription(''); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Create Collection</button>
                  <button type="button" onClick={() => { const firstCollection = store.collections.at(0); if (firstCollection) { KnowledgeWorkspaceService.assignToCollection(selected.id, firstCollection.id); refresh() } }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Assign to first collection</button>
                </div>

                <div
                  className="mt-3 rounded-2xl border border-dashed border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm text-[var(--srg-text-muted)]"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const files = Array.from(event.dataTransfer.files)
                    void KnowledgeWorkspaceService.importFiles(files, actorName, 'drag-drop').then(() => refresh())
                  }}
                >
                  Drag & drop import zone (desktop/tablet/mobile-friendly fallback to file picker).
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <label className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 cursor-pointer">
                    Import local
                    <input hidden type="file" onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      void KnowledgeWorkspaceService.importFiles([file], actorName, 'local').then(() => refresh())
                      event.target.value = ''
                    }} />
                  </label>
                  <label className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 cursor-pointer">
                    Import multiple
                    <input hidden type="file" multiple onChange={(event) => {
                      const files = Array.from(event.target.files ?? [])
                      if (files.length === 0) return
                      void KnowledgeWorkspaceService.importFiles(files, actorName, 'multiple').then(() => refresh())
                      event.target.value = ''
                    }} />
                  </label>
                  <button type="button" onClick={() => runTextImport('zip')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import ZIP</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.importArchivePlaceholder('zip', archiveName || 'enterprise-zip', actorName); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Analyze ZIP</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.importArchivePlaceholder('rar', archiveName || 'enterprise-rar', actorName); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Analyze RAR</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.importArchivePlaceholder('7z', archiveName || 'enterprise-7z', actorName); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Analyze 7Z</button>
                  <button type="button" onClick={() => runTextImport('markdown')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import Markdown</button>
                  <button type="button" onClick={() => runTextImport('pdf')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import PDF</button>
                  <button type="button" onClick={() => runTextImport('csv')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import CSV</button>
                  <button type="button" onClick={() => runTextImport('json')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import JSON</button>
                  <button type="button" onClick={() => runTextImport('doc')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import DOC</button>
                  <button type="button" onClick={() => runTextImport('docx')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import DOCX</button>
                  <button type="button" onClick={() => runTextImport('xls')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import XLS</button>
                  <button type="button" onClick={() => runTextImport('xlsx')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import XLSX</button>
                  <button type="button" onClick={() => runTextImport('html')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import HTML</button>
                  <button type="button" onClick={() => runTextImport('images')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import Images</button>
                  <button type="button" onClick={() => runTextImport('audio')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import Audio</button>
                  <button type="button" onClick={() => runTextImport('video')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import Video</button>
                  <button type="button" onClick={() => runTextImport('network')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import Network</button>
                  <button type="button" onClick={() => runTextImport('sharepoint')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import SharePoint</button>
                  <button type="button" onClick={() => runTextImport('google-drive')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import GDrive</button>
                  <button type="button" onClick={() => runTextImport('onedrive')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import OneDrive</button>
                  <button type="button" onClick={() => runTextImport('dropbox')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Import Dropbox</button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input value={archiveName} onChange={(event) => setArchiveName(event.target.value)} placeholder="Archive base name" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <input value={ocrLanguage} onChange={(event) => setOcrLanguage(event.target.value)} placeholder="OCR language (fr/en)" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <input value={importTitle} onChange={(event) => setImportTitle(event.target.value)} placeholder="Import title" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Import text payload" className="min-h-16 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <input value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder="Import URL" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.importFromUrl(urlInput, actorName); setUrlInput(''); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Import URL</button>
                  <input value={githubInput} onChange={(event) => setGithubInput(event.target.value)} placeholder="Import GitHub repo/url" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.importFromGithub(githubInput, actorName); setGithubInput(''); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Import GitHub</button>
                </div>
              </Section>

              <Section title="RAG Center (app-layer)" description="Select docs/collections/categories and preview retrieval context without creating a RAG engine.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <select value={ragCollectionId} onChange={(event) => setRagCollectionId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">
                    <option value="all">all collections</option>
                    {store.collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
                  </select>
                  <select value={ragCategory} onChange={(event) => setRagCategory(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">
                    <option value="all">all categories</option>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <input type="number" min={1} max={20} value={ragChunkCount} onChange={(event) => setRagChunkCount(Number(event.target.value))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={runRagPreview} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 text-sm font-semibold text-white">Preview RAG Context</button>
                </div>
                <div className="mt-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">
                  <p>Selected docs: {checkedDocuments.length}</p>
                  <p>Context used chunks: {ragChunkCount}</p>
                  <p>References:</p>
                  {summary.ragHistory.slice(0, 1).flatMap((run) => run.references).slice(0, 8).map((reference) => (
                    <p key={`${reference.documentId}-${reference.title}`}>{reference.title} | score {reference.score} | {reference.source}</p>
                  ))}
                  <pre className="mt-3 whitespace-pre-wrap text-[11px]">{ragPreview || 'Run preview to see context and sources.'}</pre>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.connectToGenerate(selectedDocumentIds); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Send Context to Generate</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.connectToConversation(selectedDocumentIds); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Send Context to Conversation</button>
                </div>
              </Section>

              <Section title="Enterprise Search (EDI)" description="Filtres metier: annee, chantier, client, fournisseur, equipement, reference, puissance, RPM, numero serie, technicien.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
                  <input value={enterpriseFilters.text} onChange={(event) => updateEnterpriseFilters({ text: event.target.value })} placeholder="Requete metier" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input value={enterpriseFilters.year} onChange={(event) => updateEnterpriseFilters({ year: event.target.value })} placeholder="Annee (ex: 2022)" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input value={enterpriseFilters.chantier} onChange={(event) => updateEnterpriseFilters({ chantier: event.target.value })} placeholder="Chantier / Projet" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input value={enterpriseFilters.client} onChange={(event) => updateEnterpriseFilters({ client: event.target.value })} placeholder="Client" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input value={enterpriseFilters.fournisseur} onChange={(event) => updateEnterpriseFilters({ fournisseur: event.target.value })} placeholder="Fournisseur" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input value={enterpriseFilters.equipement} onChange={(event) => updateEnterpriseFilters({ equipement: event.target.value })} placeholder="Equipement" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input value={enterpriseFilters.reference} onChange={(event) => updateEnterpriseFilters({ reference: event.target.value })} placeholder="Reference" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input value={enterpriseFilters.numeroSerie} onChange={(event) => updateEnterpriseFilters({ numeroSerie: event.target.value })} placeholder="Numero serie" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input type="number" value={enterpriseFilters.puissanceKwMin} onChange={(event) => updateEnterpriseFilters({ puissanceKwMin: Number(event.target.value) || 0 })} placeholder="KW min" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input type="number" value={enterpriseFilters.puissanceKwMax} onChange={(event) => updateEnterpriseFilters({ puissanceKwMax: Number(event.target.value) || 0 })} placeholder="KW max" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input type="number" value={enterpriseFilters.rpmMin} onChange={(event) => updateEnterpriseFilters({ rpmMin: Number(event.target.value) || 0 })} placeholder="RPM min" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <input type="number" value={enterpriseFilters.rpmMax} onChange={(event) => updateEnterpriseFilters({ rpmMax: Number(event.target.value) || 0 })} placeholder="RPM max" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
                    <input type="checkbox" checked={enterpriseFilters.semanticUi} onChange={(event) => updateEnterpriseFilters({ semanticUi: event.target.checked })} /> semantic UI
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
                    <input type="checkbox" checked={enterpriseFilters.favoritesOnly} onChange={(event) => updateEnterpriseFilters({ favoritesOnly: event.target.checked })} /> favorites only
                  </label>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.searchEnterprise(enterpriseFilters, true); refresh() }} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Run enterprise search</button>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-[var(--srg-text-muted)]">
                  <p className="font-semibold text-[var(--srg-text-title)]">Results: {enterpriseDocuments.length}</p>
                  {enterpriseDocuments.slice(0, 12).map((item) => (
                    <button key={item.id} type="button" onClick={() => setSelectedDocumentId(item.id)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-left">
                      {item.title} | {item.classification.annee} | {item.classification.chantier || 'n/a'} | {item.classification.fournisseur || 'n/a'} | {item.extraction.puissanceKw || 0} KW | {item.extraction.rpm || 0} RPM
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Decompression + OCR Queue" description="Suivi des archives decomposes et pipeline OCR applicatif (placeholder).">
                <div className="grid gap-3 lg:grid-cols-2 text-xs text-[var(--srg-text-muted)]">
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
                    <p className="font-semibold text-[var(--srg-text-title)]">Archive decomposition</p>
                    {decompressions.length === 0 ? <p>Aucune archive analysee.</p> : decompressions.slice(0, 8).map((item) => <p key={item.id}>{item.archiveType.toUpperCase()} | {item.archiveName} | files {item.tree.length}</p>)}
                  </div>
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
                    <p className="font-semibold text-[var(--srg-text-title)]">OCR queue</p>
                    {ocrQueue.length === 0 ? <p>Aucun item OCR.</p> : ocrQueue.slice(0, 10).map((item) => <p key={item.id}>{item.documentId} | {item.status} | {item.progress}% | conf {item.confidence}</p>)}
                  </div>
                </div>
              </Section>

              <Section title="Document Graph" description="Visual graph app-layer des relations entreprise/projet/chantier/equipement/documents.">
                <div className="grid gap-3 lg:grid-cols-2 text-xs text-[var(--srg-text-muted)]">
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
                    <p className="font-semibold text-[var(--srg-text-title)]">Nodes ({graph.nodes.length})</p>
                    {graph.nodes.slice(0, 16).map((node) => <p key={node.id}>{node.type} | {node.label}</p>)}
                  </div>
                  <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
                    <p className="font-semibold text-[var(--srg-text-title)]">Edges ({graph.edges.length})</p>
                    {graph.edges.slice(0, 20).map((edge) => <p key={edge.id}>{edge.relation}: {edge.from} {'->'} {edge.to}</p>)}
                  </div>
                </div>
              </Section>

              <Section title="Report Center + AI Response Metadata" description="Exports enterprise PDF/Word/Excel/CSV/Markdown/JSON/Printable et reponses IA tracees.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
                  <input value={reportTitle} onChange={(event) => setReportTitle(event.target.value)} placeholder="Report title" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <button type="button" onClick={() => { void exportEnterprise('pdf') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export PDF</button>
                  <button type="button" onClick={() => { void exportEnterprise('word') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export Word</button>
                  <button type="button" onClick={() => { void exportEnterprise('excel') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export Excel</button>
                  <button type="button" onClick={() => { void exportEnterprise('csv') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export CSV</button>
                  <button type="button" onClick={() => { void exportEnterprise('markdown') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export Markdown</button>
                  <button type="button" onClick={() => { void exportEnterprise('json') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export JSON</button>
                  <button type="button" onClick={() => { void exportEnterprise('printable') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export Printable</button>
                </div>
                <div className="mt-3 grid gap-3 text-sm">
                  <input value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} placeholder="Question IA entreprise" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
                  <button type="button" onClick={runEnterpriseAi} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Generate AI answer with metadata</button>
                  <pre className="whitespace-pre-wrap rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">{aiPreview || 'Run AI question to preview text/audio/summary/source metadata.'}</pre>
                </div>
                <div className="mt-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">
                  <p className="font-semibold text-[var(--srg-text-title)]">AI history</p>
                  {aiAnswers.length === 0 ? <p>No AI enterprise answers yet.</p> : aiAnswers.slice(0, 8).map((item) => <p key={item.id}>{item.question} | confidence {item.confidenceScore} | docs {item.documentsUsed.length}</p>)}
                </div>
              </Section>
            </>
          )}
        </section>
      </div>

      <Section title="Integrations" description="Connected to Generate, Conversation, Prompt Studio, Prompt Templates, Projects, AI Agents, Marketplace surface, History and Dashboard.">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          {[
            ['/generate', 'Generate'],
            ['/chat', 'Conversation'],
            ['/prompt-studio', 'Prompt Studio'],
            ['/prompt-templates', 'Prompt Templates'],
            ['/projects', 'Projects'],
            ['/agents', 'AI Agents'],
            ['/reviews', 'Marketplace'],
            ['/history', 'History'],
            ['/dashboard', 'Dashboard'],
            ['/knowledge-center', 'Knowledge Center'],
          ].map(([href, label]) => (
            <Link
              key={href}
              to={href}
              onClick={() => KnowledgeWorkspaceService.registerIntegration(String(label).toLowerCase())}
              className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-center font-semibold text-[var(--srg-text-title)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Export" description="Export knowledge in Markdown, PDF, JSON, CSV and ZIP formats.">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { void exportSelection('markdown') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Export Markdown</button>
          <button type="button" onClick={() => { void exportSelection('pdf') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Export PDF</button>
          <button type="button" onClick={() => { void exportSelection('json') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Export JSON</button>
          <button type="button" onClick={() => { void exportSelection('csv') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Export CSV</button>
          <button type="button" onClick={() => { void exportSelection('word') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Export Word</button>
          <button type="button" onClick={() => { void exportSelection('excel') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Export Excel</button>
          <button type="button" onClick={() => { void exportSelection('printable') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Export Printable</button>
          <button type="button" onClick={() => { void exportSelection('zip') }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm">Export ZIP</button>
          <button type="button" onClick={() => { KnowledgeWorkspaceService.reindexAll(); refresh() }} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 text-sm font-semibold text-white">Reindex All</button>
        </div>
      </Section>

      <Section title="Observability" description="Timeline, events, diagnostics, imports, indexing, search, consultation and export metrics.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3"><p>Imports</p><p className="font-semibold text-[var(--srg-text-title)]">{summary.imports}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3"><p>Searches</p><p className="font-semibold text-[var(--srg-text-title)]">{summary.searchHistory.length}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3"><p>Exports</p><p className="font-semibold text-[var(--srg-text-title)]">{summary.exportHistory.length}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3"><p>Index chunks</p><p className="font-semibold text-[var(--srg-text-title)]">{summary.charts.indexations.reduce((sum, item) => sum + item, 0)}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3"><p>Latency samples</p><p className="font-semibold text-[var(--srg-text-title)]">{summary.charts.latency.length}</p></div>
        </div>
        <div className="mt-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">
          <p>Imports graph: {sparkline(summary.charts.imports)}</p>
          <p>Index graph: {sparkline(summary.charts.indexations)}</p>
          <p>Search graph: {sparkline(summary.charts.searches)}</p>
          <p>Volume graph: {sparkline(summary.charts.volume)}</p>
          <p>Latency graph: {sparkline(summary.charts.latency)}</p>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
            <p className="font-semibold text-[var(--srg-text-title)]">Import history</p>
            {importHistory.map((item) => <p key={item.id}>{item.type} | {item.documentIds.length} docs | {new Date(item.createdAt).toLocaleString()}</p>)}
          </div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
            <p className="font-semibold text-[var(--srg-text-title)]">Search history</p>
            {searchHistory.map((item) => <p key={item.id}>{item.query || 'empty'} | {item.resultCount} results</p>)}
          </div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
            <p className="font-semibold text-[var(--srg-text-title)]">Export history</p>
            {exportHistory.map((item) => <p key={item.id}>{item.format} | {item.documentIds.length} docs</p>)}
          </div>
        </div>
      </Section>

      <Section title="Similar Documents" description="Suggested similar references from tag/category proximity.">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3 text-sm">
          {similarDocuments.length === 0 ? <p className="text-[var(--srg-text-muted)]">No similar document suggestions for current query.</p> : null}
          {similarDocuments.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelectedDocumentId(item.id)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-left">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
              <p className="text-xs text-[var(--srg-text-muted)]">{item.category} | score {item.index.metadata.score}</p>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
