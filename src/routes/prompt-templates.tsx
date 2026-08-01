import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import WorkspaceSkeleton from '#/app/components/WorkspaceSkeleton'
import TemplateActionsMenu from '#/app/components/templates/TemplateActionsMenu'
import TemplateCategorySidebar from '#/app/components/templates/TemplateCategorySidebar'
import TemplateCreateWizard from '#/app/components/templates/TemplateCreateWizard'
import TemplateExamples from '#/app/components/templates/TemplateExamples'
import TemplateFilters from '#/app/components/templates/TemplateFilters'
import TemplateGrid from '#/app/components/templates/TemplateGrid'
import TemplateList from '#/app/components/templates/TemplateList'
import TemplateMetadata from '#/app/components/templates/TemplateMetadata'
import TemplatePreview from '#/app/components/templates/TemplatePreview'
import TemplateRating from '#/app/components/templates/TemplateRating'
import TemplateSearch from '#/app/components/templates/TemplateSearch'
import TemplateStatistics from '#/app/components/templates/TemplateStatistics'
import TemplateToolbar from '#/app/components/templates/TemplateToolbar'
import TemplateVariables from '#/app/components/templates/TemplateVariables'
import CollaborationWorkspacePanel from '#/app/components/collaboration/CollaborationWorkspacePanel'
import type {TemplateVariable} from '#/app/components/templates/TemplateVariables';
import PublishTemplateDialog from '#/app/components/templates/PublishTemplateDialog'
import DuplicateTemplateDialog from '#/app/components/templates/DuplicateTemplateDialog'
import ArchiveTemplateDialog from '#/app/components/templates/ArchiveTemplateDialog'
import DeleteTemplateDialog from '#/app/components/templates/DeleteTemplateDialog'
import { useBusiness } from '#/app/hooks/useBusiness'
import { usePrompts } from '#/app/hooks/usePrompts'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export const Route = createFileRoute('/prompt-templates')({
  component: PromptTemplatesPage,
})

type TemplateStatus = 'Official' | 'Community' | 'Personal' | 'Enterprise' | 'Draft' | 'Archived'
type ViewMode = 'grid' | 'list'
type PendingDialog = 'publish' | 'duplicate' | 'archive' | 'delete' | null

type TemplateWorkspaceItem = {
  id: string
  projectId: string
  name: string
  description: string
  category: string
  tags: string[]
  version: string
  provider: string
  status: TemplateStatus
  favorite: boolean
  updatedAt: string
  createdAt: string
  language: string
  model: string
  author: string
  content: string
  variables: TemplateVariable[]
  exampleInput: string
  outputExample: string
  uses: number
}

function PromptTemplatesPage() {
  const business = useBusiness()
  const { prompts, createPrompt, updatePrompt, favoritePrompt, duplicatePrompt, archivePrompt, deletePrompt, loading } = usePrompts()
  const preferences = WorkspacePreferencesService.getPreferences()
  const actorId = business.currentSession ? business.currentSession.userId : (business.snapshot.users[0]?.id ?? 'system')
  const actorName = business.snapshot.users.find((item) => item.id === actorId)?.username ?? 'System'
  const availableUsers = business.snapshot.users.map((item) => ({ id: item.id, username: item.username }))

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<ViewMode>(preferences.pageLayouts['prompt-templates'] === 'list' ? 'list' : 'grid')
  const [sortKey, setSortKey] = useState<'updatedAt' | 'createdAt' | 'name'>('updatedAt')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [pendingDialog, setPendingDialog] = useState<PendingDialog>(null)
  const [filters, setFilters] = useState({
    category: '',
    provider: '',
    version: '',
    favoritesOnly: false,
    archivedOnly: false,
    language: '',
  })

  useEffect(() => {
    WorkspacePreferencesService.setPageLayout('prompt-templates', viewMode)
    WorkspacePreferencesService.setSort('prompt-templates', `${sortKey}:desc`)
    WorkspacePreferencesService.setFilters('prompt-templates', filters)
  }, [viewMode, sortKey, filters])

  const templates = useMemo<TemplateWorkspaceItem[]>(() => {
    return prompts.map((prompt) => {
      const latestVersion = prompt.versions.at(-1)
      const variables = latestVersion?.variables ?? []
      const recommendedOutput = prompt.content.slice(0, 260)
      const status: TemplateStatus =
        prompt.status === 'archived'
          ? 'Archived'
          : prompt.status === 'draft'
            ? 'Draft'
            : prompt.favorite
              ? 'Official'
              : 'Community'

      return {
        id: prompt.id,
        projectId: prompt.projectId,
        name: prompt.name,
        description: prompt.description,
        category: prompt.category,
        tags: prompt.tags,
        version: `v${Math.max(1, prompt.versions.length)}.${prompt.favorite ? '1' : '0'}`,
        provider: prompt.provider,
        status,
        favorite: prompt.favorite,
        updatedAt: prompt.updatedAt,
        createdAt: prompt.createdAt,
        language: prompt.language,
        model: prompt.model,
        author: latestVersion?.author || 'System',
        content: prompt.content,
        variables: variables.map((variable) => ({
          name: `{{${variable.name}}}`,
          type: variable.required ? 'required' : 'optional',
          defaultValue: variable.example,
          description: variable.description,
        })),
        exampleInput: variables.map((variable) => `${variable.name}: ${variable.example}`).join('\n') || 'No variable input required.',
        outputExample: recommendedOutput.length > 0 ? `Expected response style:\n${recommendedOutput}` : 'No sample output available.',
        uses: prompt.runCount,
      }
    })
  }, [prompts])

  const categories = useMemo(() => {
    const countMap = new Map<string, number>()
    templates.forEach((template) => {
      const key = template.category || 'Uncategorized'
      countMap.set(key, (countMap.get(key) ?? 0) + 1)
    })

    const values = Array.from(countMap.entries()).map(([name, count]) => ({ name, count }))
    return [{ name: 'All', count: templates.length }, ...values.sort((a, b) => a.name.localeCompare(b.name))]
  }, [templates])

  const collections = useMemo(
    () => [
      { name: 'Favoris', count: templates.filter((template) => template.favorite).length },
      { name: 'Récents', count: templates.filter((template) => template.updatedAt >= '2026-07-15').length },
      { name: 'Archivés', count: templates.filter((template) => template.status === 'Archived').length },
      { name: 'Publiés', count: templates.filter((template) => template.status === 'Official').length },
    ],
    [templates],
  )

  const visibleTemplates = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = templates
      .filter((template) => {
        if (!query) return true
        return (
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          template.category.toLowerCase().includes(query)
        )
      })
      .filter((template) => selectedCategory === 'All' || template.category === selectedCategory)
      .filter((template) => !filters.category || template.category.toLowerCase().includes(filters.category.toLowerCase()))
      .filter((template) => !filters.provider || template.provider.toLowerCase().includes(filters.provider.toLowerCase()))
      .filter((template) => !filters.version || template.version.toLowerCase().includes(filters.version.toLowerCase()))
      .filter((template) => !filters.language || template.language.toLowerCase().includes(filters.language.toLowerCase()))
      .filter((template) => (filters.favoritesOnly ? template.favorite : true))
      .filter((template) => (filters.archivedOnly ? template.status === 'Archived' : template.status !== 'Archived'))

    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortKey === 'createdAt') {
        return a.createdAt > b.createdAt ? -1 : 1
      }
      return a.updatedAt > b.updatedAt ? -1 : 1
    })
  }, [templates, search, selectedCategory, filters, sortKey])

  const selectedTemplate = useMemo<TemplateWorkspaceItem | null>(() => {
    if (selectedTemplateId) {
      const fromSelection = templates.find((template) => template.id === selectedTemplateId)
      if (fromSelection) return fromSelection
    }
    return visibleTemplates[0] || null
  }, [templates, visibleTemplates, selectedTemplateId])

  const selectedTemplateName = selectedTemplate ? selectedTemplate.name : 'template'

  const quickStats = useMemo(
    () => ({
      total: templates.length,
      favorites: templates.filter((template) => template.favorite).length,
      official: templates.filter((template) => template.status === 'Official').length,
      community: templates.filter((template) => template.status === 'Community').length,
      uses: templates.reduce((sum, template) => sum + template.uses, 0),
    }),
    [templates],
  )

  const gridData = useMemo(
    () =>
      visibleTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        version: template.version,
        provider: template.provider,
        status: template.status,
        favorite: template.favorite,
      })),
    [visibleTemplates],
  )

  const listData = useMemo(
    () =>
      visibleTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        version: template.version,
        provider: template.provider,
        updatedAt: template.updatedAt,
        status: template.status,
        favorite: template.favorite,
      })),
    [visibleTemplates],
  )

  const handleCreateTemplate = (payload: {
    name: string
    category: string
    description: string
    tags: string[]
    variables: TemplateVariable[]
    content: string
  }) => {
    const created = createPrompt({
      projectId: 'project-1',
      name: payload.name,
      description: payload.description,
      category: 'utility',
      tags: payload.tags,
      content: payload.content,
      provider: 'OpenAI',
      model: 'gpt-5',
      language: 'Français',
      variables: payload.variables.map((variable) => ({
        name: variable.name.replace(/^{\{|\}}$/g, '').replace(/[{}]/g, '').trim(),
        description: variable.description,
        example: variable.defaultValue ?? '',
        required: variable.type.toLowerCase() === 'required',
      })),
    })

    CollaborationWorkspaceService.createVersion({
      entityType: 'template',
      entityId: created.id,
      authorId: actorId,
      authorName: actorName,
      comment: 'Template created',
      changeSummary: 'Initial template version',
      snapshot: created.content,
      projectId: created.projectId,
    })

    setSelectedTemplateId(created.id)
    setWizardOpen(false)
  }

  const handleOpen = (id: string) => {
    setSelectedTemplateId(id)
  }

  const handleToggleFavorite = (id: string) => {
    favoritePrompt(id)
  }

  const handleDuplicate = (id: string) => {
    setSelectedTemplateId(id)
    setPendingDialog('duplicate')
  }

  const handleCreatePrompt = (_id: string) => {
    // Reuse existing Prompt Studio as creation target.
    void _id
  }

  const closeDialogs = () => {
    setPendingDialog(null)
  }

  const confirmPublish = () => {
    if (selectedTemplate) {
      CollaborationWorkspaceService.transitionWorkflow({
        entityType: 'template',
        entityId: selectedTemplate.id,
        action: 'publish',
        actorId,
        actorName,
        projectId: selectedTemplate.projectId,
      })
    }
    closeDialogs()
  }

  const confirmDuplicate = () => {
    if (!selectedTemplate) return
    duplicatePrompt(selectedTemplate.id)
    closeDialogs()
  }

  const confirmArchive = () => {
    if (!selectedTemplate) return
    archivePrompt(selectedTemplate.id)
    CollaborationWorkspaceService.transitionWorkflow({
      entityType: 'template',
      entityId: selectedTemplate.id,
      action: 'archive',
      actorId,
      actorName,
      projectId: selectedTemplate.projectId,
    })
    closeDialogs()
  }

  const confirmDelete = () => {
    if (!selectedTemplate) return
    deletePrompt(selectedTemplate.id)
    setSelectedTemplateId(null)
    closeDialogs()
  }

  const compiledPrompt = useMemo(() => {
    if (!selectedTemplate) {
      return ''
    }

    return selectedTemplate.variables.reduce((promptText, variable) => {
      const key = variable.name
      const value = variable.defaultValue ?? `[${variable.name}]`
      return promptText.split(key).join(value)
    }, selectedTemplate.content)
  }, [selectedTemplate])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Prompt Templates" description="Espace de travail officiel pour explorer, filtrer et publier vos templates de prompt." />
        <WorkspaceSkeleton variant="templates" description="Chargement du catalogue, des filtres et du panneau de prévisualisation." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prompt Templates"
        description="Espace de travail officiel pour explorer, filtrer et publier vos templates de prompt."
        actions={
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="rounded-3xl bg-[var(--srg-color-primary-500)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
            aria-label="Create Template"
          >
            Create Template
          </button>
        }
      />

      <TemplateStatistics
        total={quickStats.total}
        favorites={quickStats.favorites}
        official={quickStats.official}
        community={quickStats.community}
        uses={quickStats.uses}
      />

      <div className="flex justify-end lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen((open) => !open)}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]"
          aria-expanded={mobileSidebarOpen}
          aria-controls="template-sidebar"
        >
          {mobileSidebarOpen ? 'Masquer la navigation' : 'Afficher la navigation'}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <aside id="template-sidebar" className={`${mobileSidebarOpen ? 'block' : 'hidden'} xl:block`}>
          <TemplateCategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => setSelectedCategory(category)}
          />

          <div className="mt-6">
            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Collections</h3>
              <div className="mt-4 space-y-2">
                {collections.map((collection) => (
                  <button
                    key={collection.name}
                    type="button"
                    onClick={() => {
                      if (collection.name === 'Favoris') {
                        setFilters((current) => ({ ...current, favoritesOnly: true, archivedOnly: false }))
                      }
                      if (collection.name === 'Archivés') {
                        setFilters((current) => ({ ...current, archivedOnly: true, favoritesOnly: false }))
                      }
                      if (collection.name === 'Publiés') {
                        setSearch('official')
                      }
                      if (collection.name === 'Récents') {
                        setSortKey('updatedAt')
                      }
                    }}
                    className="flex w-full items-center justify-between rounded-3xl bg-[var(--srg-surface-strong)] px-4 py-3 text-left text-sm font-semibold text-[var(--srg-text-title)]"
                  >
                    <span>{collection.name}</span>
                    <span className="rounded-full bg-[var(--srg-surface)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{collection.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <TemplateToolbar
            onCreate={() => setWizardOpen(true)}
            onImport={() => undefined}
            onExport={() => undefined}
            onRefresh={() => setSearch('')}
            onToggleView={() => setViewMode((mode) => (mode === 'grid' ? 'list' : 'grid'))}
            viewMode={viewMode}
          />

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <TemplateSearch
              value={search}
              onSearch={(value) => setSearch(value)}
              onValueChange={(value) => setSearch(value)}
            />

            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <label className="block text-sm font-semibold text-[var(--srg-text-title)]" htmlFor="template-sort">
                Tri
              </label>
              <select
                id="template-sort"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
                className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
              >
                <option value="updatedAt">Dernière modification</option>
                <option value="createdAt">Date de création</option>
                <option value="name">Nom</option>
              </select>
            </div>
          </div>

          <TemplateFilters
            category={filters.category}
            provider={filters.provider}
            version={filters.version}
            favoritesOnly={filters.favoritesOnly}
            archivedOnly={filters.archivedOnly}
            language={filters.language}
            onChange={(updated) => setFilters((current) => ({ ...current, ...updated }))}
          />

          {visibleTemplates.length === 0 ? (
            <EmptyState
              eyebrow="Templates"
              illustration={<span aria-hidden>◈</span>}
              title="Aucun template"
              description="Aucun template ne correspond aux filtres actifs ou le catalogue est vide."
              action={<button type="button" onClick={() => setWizardOpen(true)} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Créer un template</button>}
            />
          ) : viewMode === 'grid' ? (
            <TemplateGrid
              templates={gridData}
              onOpen={handleOpen}
              onDuplicate={handleDuplicate}
              onCreatePrompt={handleCreatePrompt}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <TemplateList
              templates={listData}
              onOpen={handleOpen}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </section>

        <section className="space-y-6">
          {selectedTemplate ? (
            <>
              <TemplateActionsMenu
                onEdit={() => setWizardOpen(true)}
                onDuplicate={() => setPendingDialog('duplicate')}
                onCreatePrompt={() => undefined}
                onPublish={() => setPendingDialog('publish')}
                onArchive={() => setPendingDialog('archive')}
                onDelete={() => setPendingDialog('delete')}
              />

              <TemplatePreview
                description={selectedTemplate.description}
                content={selectedTemplate.content}
                variables={selectedTemplate.variables}
                exampleInput={selectedTemplate.exampleInput}
                compiledPrompt={compiledPrompt}
              />

              <TemplateMetadata
                author={selectedTemplate.author}
                version={selectedTemplate.version}
                createdAt={selectedTemplate.createdAt}
                updatedAt={selectedTemplate.updatedAt}
                language={selectedTemplate.language}
                provider={selectedTemplate.provider}
                recommendedModel={selectedTemplate.model}
              />

              <TemplateVariables variables={selectedTemplate.variables} />

              <TemplateExamples
                promptExample={selectedTemplate.exampleInput}
                outputExample={selectedTemplate.outputExample}
              />

              <TemplateRating
                score={Math.min(5, 3.5 + selectedTemplate.uses / 20)}
                uses={selectedTemplate.uses}
                popularity={Math.min(100, Math.round((selectedTemplate.uses / Math.max(1, quickStats.uses)) * 100))}
              />

              <CollaborationWorkspacePanel
                entityType="template"
                entityId={selectedTemplate.id}
                projectId={selectedTemplate.projectId}
                actorId={actorId}
                actorName={actorName}
                users={availableUsers}
                snapshot={selectedTemplate.content}
                onRestoreSnapshot={(snapshot) => {
                  updatePrompt(selectedTemplate.id, {
                    content: snapshot,
                    versionComment: 'Template restored from collaboration version',
                  })
                }}
              />
            </>
          ) : (
            <EmptyState
              eyebrow="Templates"
              illustration={<span aria-hidden>□</span>}
              title="Sélectionnez un template"
              description="Le panneau latéral affichera la prévisualisation, les variables et les métadonnées du template actif."
            />
          )}
        </section>
      </div>

      {wizardOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Template creation wizard">
          <div className="h-full w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-[var(--srg-surface)] p-6 shadow-[0_36px_68px_rgba(13,30,14,0.36)]">
            <TemplateCreateWizard
              onCreate={handleCreateTemplate}
              onCancel={() => setWizardOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {pendingDialog === 'publish' ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Publish template confirmation">
          <div className="w-full max-w-md">
            <PublishTemplateDialog templateName={selectedTemplateName} onConfirm={confirmPublish} onCancel={closeDialogs} />
          </div>
        </div>
      ) : null}

      {pendingDialog === 'duplicate' ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Duplicate template confirmation">
          <div className="w-full max-w-md">
            <DuplicateTemplateDialog templateName={selectedTemplateName} onConfirm={confirmDuplicate} onCancel={closeDialogs} />
          </div>
        </div>
      ) : null}

      {pendingDialog === 'archive' ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Archive template confirmation">
          <div className="w-full max-w-md">
            <ArchiveTemplateDialog templateName={selectedTemplateName} onConfirm={confirmArchive} onCancel={closeDialogs} />
          </div>
        </div>
      ) : null}

      {pendingDialog === 'delete' ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Delete template confirmation">
          <div className="w-full max-w-md">
            <DeleteTemplateDialog templateName={selectedTemplateName} onConfirm={confirmDelete} onCancel={closeDialogs} />
          </div>
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 text-sm text-[var(--srg-text-muted)]">
        <span className="font-semibold text-[var(--srg-text-title)]">Integration path:</span>{' '}
        <Link to="/prompt-studio" className="text-[var(--srg-color-primary-500)] underline-offset-4 hover:underline">
          Prompt Studio
        </Link>
      </div>
    </div>
  )
}
