import type { ChangeEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import PromptActionsMenu from '#/app/components/PromptActionsMenu'
import PromptCreateWizard from '#/app/components/PromptCreateWizard'
import PromptFilters from '#/app/components/PromptFilters'
import PromptSearch from '#/app/components/PromptSearch'
import PromptList from '#/app/components/PromptList'
import PromptEditor from '#/app/components/PromptEditor'
import PromptPreview from '#/app/components/PromptPreview'
import PromptHistory from '#/app/components/PromptHistory'
import PromptMetadataPanel from '#/app/components/PromptMetadataPanel'
import PromptTestPanel from '#/app/components/PromptTestPanel'
import PromptVersionPanel from '#/app/components/PromptVersionPanel'
import WorkspaceSkeleton from '#/app/components/WorkspaceSkeleton'
import CollaborationWorkspacePanel from '#/app/components/collaboration/CollaborationWorkspacePanel'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useProjects } from '#/app/hooks/useProjects'
import { usePrompts } from '#/app/hooks/usePrompts'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'
import { runPromptTest } from '#/app/services/PromptTestService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { PromptCollectionService } from '#/app/services/PromptCollectionService'
import { PromptImportExportService } from '#/app/services/PromptImportExportService'
import { PromptMarketplaceService } from '#/app/services/PromptMarketplaceService'
import { PromptPublishingService } from '#/app/services/PromptPublishingService'
import { PromptReviewService } from '#/app/services/PromptReviewService'
import { PromptSharingService } from '#/app/services/PromptSharingService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export const Route = createFileRoute('/prompt-studio')({
  component: PromptStudioPage,
})

function PromptStudioPage() {
  const business = useBusiness()
  const { projects, selectedProject, selectProject } = useProjects()
  const {
    prompts,
    selectedPrompt,
    selectPrompt,
    createPrompt,
    updatePrompt,
    archivePrompt,
    duplicatePrompt,
    deletePrompt,
    favoritePrompt,
    publishPrompt,
    filters,
    applyFilters,
    loading,
  } = usePrompts()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [testValues, setTestValues] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string>('')
  const [testError, setTestError] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [versionCompareIds, setVersionCompareIds] = useState<string[]>([])
  const [publishVisibility, setPublishVisibility] = useState<'internal' | 'public'>('internal')
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'txt' | 'pdf'>('json')
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [marketplaceFilters, setMarketplaceFilters] = useState(() => PromptMarketplaceService.getFilters())
  const [selectedCollectionId, setSelectedCollectionId] = useState('col-favorites')
  const actorId = business.currentSession ? business.currentSession.userId : (business.snapshot.users[0]?.id ?? 'system')
  const actorName = business.snapshot.users.find((item) => item.id === actorId)?.username ?? 'System'
  const availableUsers = business.snapshot.users.map((item) => ({ id: item.id, username: item.username }))

  const marketplaceRecords = useMemo(() => {
    const seeded = PromptMarketplaceService.hydrateFromPrompts(actorName)
    return PromptMarketplaceService.applyFilters(seeded, marketplaceFilters)
  }, [actorName, prompts.length, marketplaceFilters])

  const marketplaceRecord = selectedPrompt ? marketplaceRecords.find((item) => item.promptId === selectedPrompt.id) : undefined
  const collections = PromptCollectionService.list()
  const selectedCollection = collections.find((item) => item.id === selectedCollectionId)
  const shares = selectedPrompt ? PromptSharingService.list(selectedPrompt.id) : []
  const reviews = marketplaceRecord ? PromptReviewService.list(marketplaceRecord.id) : []
  const publishingRecord = selectedPrompt ? PromptPublishingService.get(selectedPrompt.id) : undefined

  const visiblePrompts = useMemo(
    () =>
      prompts
        .filter((prompt) => prompt.status !== 'archived')
        .filter((prompt) => (selectedProject ? prompt.projectId === selectedProject.id : true))
        .filter((prompt) => prompt.name.toLowerCase().includes(filters.query.toLowerCase()))
        .filter((prompt) => filters.provider === 'all' || prompt.provider === filters.provider)
        .filter((prompt) => filters.category === 'all' || prompt.category === filters.category),
    [prompts, selectedProject, filters],
  )

  const handleRunTest = (provider: string, model: string) => {
    if (!selectedPrompt) {
      setTestError('Sélectionnez un prompt pour exécuter le test.')
      setTestResult('')
      setTestStatus('error')
      return
    }

    setTestStatus('running')
    setTestError(null)
    setTestResult('')

    const result = runPromptTest(selectedPrompt, provider as any, model, testValues)
    if (result.status === 'error') {
      setTestStatus('error')
      setTestError(result.error ?? 'Erreur inconnue')
      setTestResult('')
    } else {
      setTestStatus('success')
      setTestError(null)
      setTestResult(result.output)
      HistoryWorkspaceService.addRecord({
        id: `prompt-test-${Date.now()}`,
        promptName: selectedPrompt.name,
        promptText: selectedPrompt.content,
        output: result.output,
        provider,
        model,
        status: 'completed',
        durationMs: result.durationMs,
        tokensInput: result.tokens,
        tokensOutput: Math.max(10, Math.ceil(result.output.length / 4)),
        costEstimate: Number(((result.tokens + Math.ceil(result.output.length / 4)) * 0.000002).toFixed(6)),
        createdAt: new Date().toISOString(),
        requestKind: 'prompt-test',
        projectId: selectedPrompt.projectId,
      })
    }
  }

  const handleChangeVariable = (name: string, value: string) => {
    setTestValues((current) => ({ ...current, [name]: value }))
  }

  const handleCreatePrompt = (payload: Parameters<typeof createPrompt>[0]) => {
    const prompt = createPrompt(payload)
    CollaborationWorkspaceService.createVersion({
      entityType: 'prompt',
      entityId: prompt.id,
      authorId: actorId,
      authorName: actorName,
      comment: 'Prompt created',
      changeSummary: 'Initial prompt version',
      snapshot: prompt.content,
      projectId: prompt.projectId,
    })
    selectPrompt(prompt.id)
    setWizardOpen(false)
  }

  const currentProjectId = selectedProject?.id ?? 'all'
  const comparedVersions = selectedPrompt?.versions.filter((version) => versionCompareIds.includes(version.id)).slice(0, 2) ?? []

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Prompt Studio" description="Composez, gérez et testez vos prompts prompt engineering." />
        <WorkspaceSkeleton variant="prompt-studio" description="Chargement du catalogue, de l’éditeur et du panneau de test." />
      </div>
    )
  }

  const exportPrompt = () => {
    if (!selectedPrompt) {
      return
    }

    PromptImportExportService.exportPrompt(selectedPrompt, exportFormat)
  }

  const handleImportPrompt = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const projectId = selectedProject?.id ?? projects[0]?.id
    if (!projectId) {
      event.target.value = ''
      return
    }

    const created = await PromptImportExportService.importFromFile(file, projectId)
    if (created) {
      selectPrompt(created.id)
    }
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Prompt Studio" description="Composez, gérez et testez vos prompts prompt engineering." />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_minmax(620px,1.4fr)_0.85fr]">
        <section className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Explorateur</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">Prompts et projets</h2>
            </div>
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
            >
              Nouveau prompt
            </button>
          </div>

          <div className="grid gap-4">
            <select
              value={currentProjectId}
              onChange={(event) => {
                const value = event.target.value
                selectProject(value === 'all' ? null : value)
              }}
              className="w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            >
              <option value="all">Tous les projets</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <PromptSearch
              value={filters.query}
              onSearch={(value) => applyFilters({ query: value })}
              onValueChange={(value) => applyFilters({ query: value })}
            />

            <PromptFilters filters={filters} onFilterChange={applyFilters} />
          </div>

          <div className="mt-6">
            {visiblePrompts.length === 0 ? (
              <EmptyState
                eyebrow="Prompt Studio"
                illustration={<span aria-hidden>◇</span>}
                title="Aucun prompt visible"
                description="Aucun prompt ne correspond au projet ou aux filtres actuels."
                action={<button type="button" onClick={() => setWizardOpen(true)} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Créer un prompt</button>}
              />
            ) : (
              <PromptList
                prompts={visiblePrompts}
                onSelect={(id) => selectPrompt(id)}
                onFavorite={(id) => favoritePrompt(id)}
              />
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Éditeur</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">Détails du prompt</h2>
            </div>
            {selectedPrompt ? (
              <PromptActionsMenu
                onDuplicate={() => duplicatePrompt(selectedPrompt.id)}
                onArchive={() => {
                  archivePrompt(selectedPrompt.id)
                  CollaborationWorkspaceService.transitionWorkflow({
                    entityType: 'prompt',
                    entityId: selectedPrompt.id,
                    action: 'archive',
                    actorId,
                    actorName,
                    projectId: selectedPrompt.projectId,
                  })
                }}
                onDelete={() => deletePrompt(selectedPrompt.id)}
              />
            ) : null}
          </div>

          <PromptEditor prompt={selectedPrompt} onChange={(updates) => selectedPrompt && updatePrompt(selectedPrompt.id, updates)} />
        </section>

        <div className="space-y-6">
          <PromptMetadataPanel prompt={selectedPrompt} />
          <PromptPreview prompt={selectedPrompt} variables={testValues} />
          <PromptHistory history={selectedPrompt?.versions ?? []} />
          <PromptVersionPanel versions={selectedPrompt?.versions ?? []} />
          {selectedPrompt ? (
            <CollaborationWorkspacePanel
              entityType="prompt"
              entityId={selectedPrompt.id}
              projectId={selectedPrompt.projectId}
              actorId={actorId}
              actorName={actorName}
              users={availableUsers}
              snapshot={selectedPrompt.content}
              onRestoreSnapshot={(snapshot) => {
                updatePrompt(selectedPrompt.id, {
                  content: snapshot,
                  versionComment: 'Restored from collaboration version',
                })
              }}
            />
          ) : null}
        </div>
      </div>

      <section className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Test et versioning</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">Exécution de prompt</h2>
          </div>
        </div>

        <PromptTestPanel
          prompt={selectedPrompt}
          values={testValues}
          onChangeValues={handleChangeVariable}
          onRun={handleRunTest}
          status={testStatus}
          result={testResult}
          error={testError}
        />

        {selectedPrompt ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Publication</p>
                  <p className="text-sm text-[var(--srg-text-muted)]">Publiez le prompt et exportez sa definition.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={exportFormat}
                    onChange={(event) => setExportFormat(event.target.value as 'json' | 'markdown' | 'txt' | 'pdf')}
                    className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm"
                  >
                    <option value="json">JSON</option>
                    <option value="markdown">Markdown</option>
                    <option value="txt">TXT</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <button type="button" onClick={exportPrompt} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter</button>
                </div>
              </div>
              <div className="mt-3">
                <input type="file" accept=".json,.md,.markdown,.txt,.yml,.yaml" onChange={(event) => { void handleImportPrompt(event) }} className="text-sm" />
              </div>
              {publishingRecord ? (
                <p className="mt-3 text-sm text-[var(--srg-text-muted)]">Workflow: {publishingRecord.stage} • version {publishingRecord.version}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <select value={publishVisibility} onChange={(event) => setPublishVisibility(event.target.value as 'internal' | 'public')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)]">
                  <option value="internal">Interne</option>
                  <option value="public">Public</option>
                </select>
                <button type="button" onClick={() => publishPrompt(selectedPrompt.id, publishVisibility)} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Publier</button>
                <button
                  type="button"
                  onClick={() => {
                    publishPrompt(selectedPrompt.id, publishVisibility)
                    CollaborationWorkspaceService.transitionWorkflow({
                      entityType: 'prompt',
                      entityId: selectedPrompt.id,
                      action: 'publish',
                      actorId,
                      actorName,
                      projectId: selectedPrompt.projectId,
                    })

                    const status = publishVisibility === 'public' ? 'published' : 'approved'
                    PromptPublishingService.transition({
                      promptId: selectedPrompt.id,
                      next: status,
                      actorName,
                      notes: publishVisibility === 'public' ? 'Published to marketplace' : 'Approved for internal sharing',
                      bump: 'patch',
                    })

                    if (marketplaceRecord) {
                      PromptMarketplaceService.setVisibility(marketplaceRecord.id, publishVisibility === 'public' ? 'public' : 'organization')
                      PromptMarketplaceService.setStatus(marketplaceRecord.id, status)
                    }
                  }}
                  className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]"
                >
                  Publier + Workflow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const share = PromptSharingService.createShare({
                      promptId: selectedPrompt.id,
                      promptName: selectedPrompt.name,
                      scope: publishVisibility === 'public' ? 'public_copy' : 'organization',
                      permission: 'read_only',
                      createdBy: actorName,
                    })
                    WorkspaceExchangeService.downloadText(`${selectedPrompt.name}-share-link.txt`, share.url)
                  }}
                  className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]"
                >
                  Partager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void PromptImportExportService.copyToClipboard(selectedPrompt)
                  }}
                  className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]"
                >
                  Copier
                </button>
              </div>
              {shares.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {shares.slice(0, 3).map((share) => (
                    <div key={share.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-xs text-[var(--srg-text-muted)]">
                      {share.scope} • {share.permission} • {share.url}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Comparaison de versions</p>
              <div className="mt-4 space-y-3">
                {selectedPrompt.versions.map((version) => (
                  <label key={version.id} className="flex items-center justify-between rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)]">
                    <span>Version {version.version} • {version.date}</span>
                    <input
                      type="checkbox"
                      checked={versionCompareIds.includes(version.id)}
                      onChange={(event) => {
                        setVersionCompareIds((current) => {
                          if (event.target.checked) {
                            return [...current.filter((item) => item !== version.id), version.id].slice(-2)
                          }
                          return current.filter((item) => item !== version.id)
                        })
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {selectedPrompt ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Collections</p>
              <div className="mt-3 flex gap-2">
                <select
                  value={selectedCollectionId}
                  onChange={(event) => setSelectedCollectionId(event.target.value)}
                  className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm"
                >
                  {collections.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCollection) {
                      PromptCollectionService.addPrompt(selectedCollection.id, selectedPrompt.id)
                    }
                  }}
                  className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold"
                >
                  Ajouter
                </button>
              </div>
              {selectedCollection ? (
                <p className="mt-3 text-xs text-[var(--srg-text-muted)]">{selectedCollection.promptIds.length} prompts dans {selectedCollection.name}</p>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Reviews Marketplace</p>
              <div className="mt-2 flex justify-end">
                <Link to="/reviews" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-xs font-semibold text-[var(--srg-text-title)]">Ouvrir la file de modération</Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={reviewStars}
                  onChange={(event) => setReviewStars(Number(event.target.value))}
                  className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
                <input
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Ajouter un commentaire"
                  className="flex-1 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!marketplaceRecord || !reviewComment.trim()) {
                      return
                    }

                    PromptReviewService.add({
                      marketplaceId: marketplaceRecord.id,
                      promptId: selectedPrompt.id,
                      authorId: actorId,
                      authorName: actorName,
                      stars: reviewStars,
                      comment: reviewComment.trim(),
                    })
                    setReviewComment('')
                  }}
                  className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold"
                >
                  Noter
                </button>
              </div>
              {reviews.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {reviews.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-xs text-[var(--srg-text-muted)]">
                      {item.authorName} • {item.stars}/5 • {item.comment}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Marketplace Search</p>
            <div className="flex flex-wrap gap-2">
              <input
                value={marketplaceFilters.text}
                onChange={(event) => {
                  const next = { ...marketplaceFilters, text: event.target.value }
                  setMarketplaceFilters(next)
                  PromptMarketplaceService.persistFilters(next)
                }}
                placeholder="Recherche prompt marketplace"
                className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm"
              />
              <select
                value={marketplaceFilters.sortBy}
                onChange={(event) => {
                  const next = {
                    ...marketplaceFilters,
                    sortBy: event.target.value as 'trending' | 'downloads' | 'rating' | 'recent' | 'price',
                  }
                  setMarketplaceFilters(next)
                  PromptMarketplaceService.persistFilters(next)
                }}
                className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm"
              >
                <option value="trending">Trending</option>
                <option value="downloads">Downloads</option>
                <option value="rating">Rating</option>
                <option value="recent">Recent</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            {marketplaceRecords.slice(0, 6).map((item) => (
              <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm">
                <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
                <p className="mt-1 text-[var(--srg-text-muted)]">
                  {item.category} • {item.authorName} • {item.status}
                </p>
                <p className="mt-1 text-xs text-[var(--srg-text-muted)]">
                  {item.downloads} downloads • {item.averageRating}/5 • {item.visibility}
                </p>
              </article>
            ))}
          </div>
        </div>

        {comparedVersions.length === 2 ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {comparedVersions.map((version) => (
              <div key={version.id} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
                <p className="font-semibold text-[var(--srg-text-title)]">Version {version.version}</p>
                <p className="mt-1 text-sm text-[var(--srg-text-muted)]">{version.comment}</p>
                <pre className="mt-4 whitespace-pre-wrap break-words rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-xs text-[var(--srg-text-title)]">{version.content}</pre>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {wizardOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl">
            <PromptCreateWizard projects={projects} onCreate={handleCreatePrompt} onClose={() => setWizardOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
