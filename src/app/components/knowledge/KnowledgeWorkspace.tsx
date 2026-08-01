import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import EmptyState from '#/app/components/EmptyState'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useKnowledgeWorkspace } from '#/app/hooks/useKnowledgeWorkspace'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import type { KnowledgeDocumentRecord, KnowledgeExportType, KnowledgeImportType } from '#/app/services/KnowledgeWorkspaceService'

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
  const { store, summary, filters, setFilters, documents, suggestions, similarDocuments, categories, tags, authors, selectedByIds, refresh } = useKnowledgeWorkspace()
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

  const selected = useMemo(() => byId(store.documents, selectedDocumentId) ?? documents.at(0), [store.documents, documents, selectedDocumentId])
  const checkedDocuments = useMemo(() => selectedByIds(selectedDocumentIds), [selectedDocumentIds, selectedByIds])
  const importHistory = summary.importHistory.slice(0, 10)
  const searchHistory = summary.searchHistory.slice(0, 10)
  const exportHistory = summary.exportHistory.slice(0, 10)

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

  return (
    <div className="space-y-6">
      <Section title="Knowledge Workspace" description="Shared documentation memory for all SRG workspaces.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Documents</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.documents}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Collections</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.collections}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Imports</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.imports}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Indexed</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.indexations}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Favorites</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.favorites}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Volume</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.volume}</p></div>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.42fr]">
        <section className="space-y-4 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Document Library</h3>
          <div className="grid gap-2">
            <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Global/full-text search" className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm" />
            <div className="grid gap-2 sm:grid-cols-2">
              <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                <option value="all">all categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value as typeof filters.type })} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                {['all', 'markdown', 'txt', 'pdf', 'docx', 'csv', 'json', 'xml', 'html', 'image', 'audio', 'video', 'web-link', 'note', 'faq', 'guide', 'documentation'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as typeof filters.status })} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                {['all', 'draft', 'validated', 'archived', 'trash'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as typeof filters.sort })} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                <option value="updatedAt:desc">updated desc</option>
                <option value="updatedAt:asc">updated asc</option>
                <option value="title:asc">title asc</option>
                <option value="title:desc">title desc</option>
                <option value="score:desc">score desc</option>
              </select>
              <input value={filters.tag} onChange={(event) => setFilters({ ...filters, tag: event.target.value })} placeholder="Tag search" className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm" />
              <input value={filters.author} onChange={(event) => setFilters({ ...filters, author: event.target.value })} placeholder="Author" className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm" list="knowledge-authors" />
              <input value={filters.date} type="date" onChange={(event) => setFilters({ ...filters, date: event.target.value })} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm" />
              <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                <input type="checkbox" checked={filters.favoritesOnly} onChange={(event) => setFilters({ ...filters, favoritesOnly: event.target.checked })} /> favorites only
              </label>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                <input type="checkbox" checked={filters.semanticUi} onChange={(event) => setFilters({ ...filters, semanticUi: event.target.checked })} /> semantic search (UI)
              </label>
            </div>
            <datalist id="knowledge-authors">
              {authors.map((author) => <option key={author} value={author} />)}
            </datalist>
            {suggestions.length > 0 ? <p className="text-xs text-[var(--sea-ink-soft)]">Suggestions: {suggestions.join(' | ')}</p> : null}
          </div>

          <div className="space-y-2 text-sm">
            {documents.length === 0 ? (
              <EmptyState eyebrow="Knowledge" illustration={<span aria-hidden>docs</span>} title="No document" description="Import or create knowledge documents." />
            ) : null}
            {documents.map((document) => (
              <article key={document.id} className={`rounded-2xl border p-3 ${selected?.id === document.id ? 'border-[var(--lagoon)] bg-[var(--surface)]' : 'border-[var(--line)] bg-[var(--surface-strong)]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <button type="button" onClick={() => setSelectedDocumentId(document.id)} className="text-left">
                    <p className="font-semibold text-[var(--sea-ink)]">{document.title}</p>
                    <p className="text-xs text-[var(--sea-ink-soft)]">{document.documentType} | {document.category} | {document.status}</p>
                  </button>
                  <label className="inline-flex items-center gap-1 text-xs text-[var(--sea-ink-soft)]">
                    <input type="checkbox" checked={selectedDocumentIds.includes(document.id)} onChange={(event) => toggleSelectedForRag(document.id, event.target.checked)} /> RAG
                  </label>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-[var(--sea-ink-soft)]">{document.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.toggleFavorite(document.id); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">{document.favorite ? 'Unfavorite' : 'Favorite'}</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.reindexDocument(document.id); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Index</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.setStatus(document.id, 'validated'); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Validate</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.setStatus(document.id, 'archived'); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Archive</button>
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
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Index status</p>
                    <p className="mt-1 text-[var(--sea-ink)]">{selected.index.status} | chunks {selected.index.chunks} | score {selected.index.metadata.score}</p>
                    <p className="text-[var(--sea-ink-soft)]">lang {selected.index.metadata.language} | size {selected.index.metadata.size} | hash {selected.index.metadata.hash}</p>
                    <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">keywords: {selected.index.metadata.keywords.join(', ') || 'n/a'}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Source</p>
                    <p className="mt-1 text-[var(--sea-ink)]">{selected.source}</p>
                    <p className="text-[var(--sea-ink-soft)]">author {selected.index.metadata.author}</p>
                    <p className="text-[var(--sea-ink-soft)]">version {selected.index.metadata.version}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="add tag" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" list="knowledge-tags" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.addTag(selected.id, tagInput); setTagInput(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Add Tag</button>
                  <input value={versionLabel} onChange={(event) => setVersionLabel(event.target.value)} placeholder="version label" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.createVersion(selected.id, versionLabel); setVersionLabel(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Create Version</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.setStatus(selected.id, 'draft'); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Restore Draft</button>
                </div>
                <datalist id="knowledge-tags">
                  {tags.map((tag) => <option key={tag} value={tag} />)}
                </datalist>

                <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm text-[var(--sea-ink)]">
                  <p className="font-semibold">Summary</p>
                  <p className="mt-1 text-[var(--sea-ink-soft)]">{selected.index.metadata.summary}</p>
                  <pre className="mt-3 whitespace-pre-wrap text-xs text-[var(--sea-ink-soft)]">{selected.content.slice(0, 1600)}</pre>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2 text-xs text-[var(--sea-ink-soft)]">
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
                    <p className="font-semibold text-[var(--sea-ink)]">Versions</p>
                    {selected.versions.slice(0, 8).map((version) => <p key={version.id}>{version.label} | {new Date(version.createdAt).toLocaleString()}</p>)}
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
                    <p className="font-semibold text-[var(--sea-ink)]">Comments</p>
                    {selected.comments.slice(0, 8).map((item) => <p key={item.id}>{item.author}: {item.message}</p>)}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <input value={commentInput} onChange={(event) => setCommentInput(event.target.value)} placeholder="Add comment" className="flex-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.addComment(selected.id, actorName, commentInput); setCommentInput(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Comment</button>
                </div>
              </Section>

              <Section title="Collections & Import" description="Import local/multiple/drag-drop/zip/url/github and format-specific imports.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <input value={newCollectionName} onChange={(event) => setNewCollectionName(event.target.value)} placeholder="Collection name" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <input value={newCollectionDescription} onChange={(event) => setNewCollectionDescription(event.target.value)} placeholder="Collection description" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.createCollection(newCollectionName, newCollectionDescription); setNewCollectionName(''); setNewCollectionDescription(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Create Collection</button>
                  <button type="button" onClick={() => { const firstCollection = store.collections[0]; KnowledgeWorkspaceService.assignToCollection(selected.id, firstCollection.id); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Assign to first collection</button>
                </div>

                <div
                  className="mt-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--sea-ink-soft)]"
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
                  <label className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 cursor-pointer">
                    Import local
                    <input hidden type="file" onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      void KnowledgeWorkspaceService.importFiles([file], actorName, 'local').then(() => refresh())
                      event.target.value = ''
                    }} />
                  </label>
                  <label className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 cursor-pointer">
                    Import multiple
                    <input hidden type="file" multiple onChange={(event) => {
                      const files = Array.from(event.target.files ?? [])
                      if (files.length === 0) return
                      void KnowledgeWorkspaceService.importFiles(files, actorName, 'multiple').then(() => refresh())
                      event.target.value = ''
                    }} />
                  </label>
                  <button type="button" onClick={() => runTextImport('zip')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import ZIP</button>
                  <button type="button" onClick={() => runTextImport('markdown')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import Markdown</button>
                  <button type="button" onClick={() => runTextImport('pdf')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import PDF</button>
                  <button type="button" onClick={() => runTextImport('csv')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import CSV</button>
                  <button type="button" onClick={() => runTextImport('json')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import JSON</button>
                  <button type="button" onClick={() => runTextImport('docx')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import DOCX</button>
                  <button type="button" onClick={() => runTextImport('html')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import HTML</button>
                  <button type="button" onClick={() => runTextImport('images')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import Images</button>
                  <button type="button" onClick={() => runTextImport('audio')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import Audio</button>
                  <button type="button" onClick={() => runTextImport('video')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">Import Video</button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input value={importTitle} onChange={(event) => setImportTitle(event.target.value)} placeholder="Import title" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Import text payload" className="min-h-16 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <input value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder="Import URL" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.importFromUrl(urlInput, actorName); setUrlInput(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Import URL</button>
                  <input value={githubInput} onChange={(event) => setGithubInput(event.target.value)} placeholder="Import GitHub repo/url" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.importFromGithub(githubInput, actorName); setGithubInput(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Import GitHub</button>
                </div>
              </Section>

              <Section title="RAG Center (app-layer)" description="Select docs/collections/categories and preview retrieval context without creating a RAG engine.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <select value={ragCollectionId} onChange={(event) => setRagCollectionId(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">
                    <option value="all">all collections</option>
                    {store.collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
                  </select>
                  <select value={ragCategory} onChange={(event) => setRagCategory(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">
                    <option value="all">all categories</option>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <input type="number" min={1} max={20} value={ragChunkCount} onChange={(event) => setRagChunkCount(Number(event.target.value))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
                  <button type="button" onClick={runRagPreview} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 text-sm font-semibold text-white">Preview RAG Context</button>
                </div>
                <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs text-[var(--sea-ink-soft)]">
                  <p>Selected docs: {checkedDocuments.length}</p>
                  <p>Context used chunks: {ragChunkCount}</p>
                  <p>References:</p>
                  {summary.ragHistory.slice(0, 1).flatMap((run) => run.references).slice(0, 8).map((reference) => (
                    <p key={`${reference.documentId}-${reference.title}`}>{reference.title} | score {reference.score} | {reference.source}</p>
                  ))}
                  <pre className="mt-3 whitespace-pre-wrap text-[11px]">{ragPreview || 'Run preview to see context and sources.'}</pre>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.connectToGenerate(selectedDocumentIds); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Send Context to Generate</button>
                  <button type="button" onClick={() => { KnowledgeWorkspaceService.connectToConversation(selectedDocumentIds); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Send Context to Conversation</button>
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
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-center font-semibold text-[var(--sea-ink)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Export" description="Export knowledge in Markdown, PDF, JSON, CSV and ZIP formats.">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { void exportSelection('markdown') }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Export Markdown</button>
          <button type="button" onClick={() => { void exportSelection('pdf') }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Export PDF</button>
          <button type="button" onClick={() => { void exportSelection('json') }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Export JSON</button>
          <button type="button" onClick={() => { void exportSelection('csv') }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Export CSV</button>
          <button type="button" onClick={() => { void exportSelection('zip') }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Export ZIP</button>
          <button type="button" onClick={() => { KnowledgeWorkspaceService.reindexAll(); refresh() }} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 text-sm font-semibold text-white">Reindex All</button>
        </div>
      </Section>

      <Section title="Observability" description="Timeline, events, diagnostics, imports, indexing, search, consultation and export metrics.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Imports</p><p className="font-semibold text-[var(--sea-ink)]">{summary.imports}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Searches</p><p className="font-semibold text-[var(--sea-ink)]">{summary.searchHistory.length}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Exports</p><p className="font-semibold text-[var(--sea-ink)]">{summary.exportHistory.length}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Index chunks</p><p className="font-semibold text-[var(--sea-ink)]">{summary.charts.indexations.reduce((sum, item) => sum + item, 0)}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Latency samples</p><p className="font-semibold text-[var(--sea-ink)]">{summary.charts.latency.length}</p></div>
        </div>
        <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs text-[var(--sea-ink-soft)]">
          <p>Imports graph: {sparkline(summary.charts.imports)}</p>
          <p>Index graph: {sparkline(summary.charts.indexations)}</p>
          <p>Search graph: {sparkline(summary.charts.searches)}</p>
          <p>Volume graph: {sparkline(summary.charts.volume)}</p>
          <p>Latency graph: {sparkline(summary.charts.latency)}</p>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="font-semibold text-[var(--sea-ink)]">Import history</p>
            {importHistory.map((item) => <p key={item.id}>{item.type} | {item.documentIds.length} docs | {new Date(item.createdAt).toLocaleString()}</p>)}
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="font-semibold text-[var(--sea-ink)]">Search history</p>
            {searchHistory.map((item) => <p key={item.id}>{item.query || 'empty'} | {item.resultCount} results</p>)}
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="font-semibold text-[var(--sea-ink)]">Export history</p>
            {exportHistory.map((item) => <p key={item.id}>{item.format} | {item.documentIds.length} docs</p>)}
          </div>
        </div>
      </Section>

      <Section title="Similar Documents" description="Suggested similar references from tag/category proximity.">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3 text-sm">
          {similarDocuments.length === 0 ? <p className="text-[var(--sea-ink-soft)]">No similar document suggestions for current query.</p> : null}
          {similarDocuments.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelectedDocumentId(item.id)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left">
              <p className="font-semibold text-[var(--sea-ink)]">{item.title}</p>
              <p className="text-xs text-[var(--sea-ink-soft)]">{item.category} | score {item.index.metadata.score}</p>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
