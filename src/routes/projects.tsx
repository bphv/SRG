import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import ProjectToolbar from '#/app/components/ProjectToolbar'
import ProjectFilters from '#/app/components/ProjectFilters'
import ProjectSearch from '#/app/components/ProjectSearch'
import ProjectGrid from '#/app/components/ProjectGrid'
import ProjectList from '#/app/components/ProjectList'
import ProjectDetailsPanel from '#/app/components/ProjectDetailsPanel'
import ProjectStatistics from '#/app/components/ProjectStatistics'
import EmptyProjects from '#/app/components/EmptyProjects'
import ProjectCreateWizard from '#/app/components/ProjectCreateWizard'
import DeleteProjectDialog from '#/app/components/DeleteProjectDialog'
import ArchiveProjectDialog from '#/app/components/ArchiveProjectDialog'
import DuplicateProjectDialog from '#/app/components/DuplicateProjectDialog'
import WorkspaceSkeleton from '#/app/components/WorkspaceSkeleton'
import CollaborationWorkspacePanel from '#/app/components/collaboration/CollaborationWorkspacePanel'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useProjects } from '#/app/hooks/useProjects'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
})

type PendingActionType = 'delete' | 'archive' | 'duplicate' | null

function ProjectsPage() {
  const business = useBusiness()
  const {
    projects,
    selectedProject,
    loading,
    filters,
    refresh,
    applyFilters,
    selectProject,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
    duplicateProject,
    favoriteProject,
  } = useProjects()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingActionType>(null)
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [shareLink, setShareLink] = useState('')
  const actorId = business.currentSession?.userId ?? business.snapshot.users[0]?.id ?? 'system'
  const actorName = business.snapshot.users.find((item) => item.id === actorId)?.username ?? 'System'
  const availableUsers = business.snapshot.users.map((item) => ({ id: item.id, username: item.username }))

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const query = filters.query.trim().toLowerCase()
        const matchesQuery =
          !query ||
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.provider.toLowerCase().includes(query)
        const matchesStatus = filters.status === 'all' || project.status === filters.status
        const matchesProvider = filters.provider === 'all' || project.provider === filters.provider
        const matchesType = filters.type === 'all' || project.type === filters.type
        return matchesQuery && matchesStatus && matchesProvider && matchesType
      })
      .sort((a, b) => {
        const factor = filters.sortOrder === 'asc' ? 1 : -1
        if (filters.sortKey === 'name') {
          return a.name.localeCompare(b.name) * factor
        }
        if (filters.sortKey === 'generationCount') {
          return (a.generationCount - b.generationCount) * factor
        }
        if (filters.sortKey === 'createdAt') {
          return (a.createdAt > b.createdAt ? 1 : -1) * factor
        }
        return (a.updatedAt > b.updatedAt ? 1 : -1) * factor
      })
  }, [projects, filters])

  const projectName = selectedProject?.name ?? ''

  const exportProjects = () => {
    WorkspaceExchangeService.downloadJson('srg-projects-export.json', filteredProjects)
  }

  const shareProject = () => {
    if (!selectedProject) {
      return
    }

    setShareLink(WorkspaceExchangeService.createShareLink('project', selectedProject.id, selectedProject.name))
  }

  const renameSelectedProject = () => {
    if (!selectedProject || !renameValue.trim()) {
      return
    }

    const updated = updateProject(selectedProject.id, { name: renameValue.trim() })
    if (updated) {
      CollaborationWorkspaceService.createVersion({
        entityType: 'project',
        entityId: updated.id,
        authorId: actorId,
        authorName: actorName,
        comment: 'Project renamed',
        changeSummary: `Name changed to ${updated.name}`,
        snapshot: JSON.stringify(updated, null, 2),
        projectId: updated.id,
      })
    }
    setRenameValue('')
  }

  const importProjects = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const imported = await WorkspaceExchangeService.parseJsonFile<Array<{
      name: string
      description: string
      provider: 'OpenAI' | 'Anthropic' | 'Azure OpenAI' | 'Cohere'
      language: string
      type: 'content' | 'research' | 'product'
    }>>(file)

    imported.forEach((item) => {
      createProject({
        name: item.name,
        description: item.description,
        provider: item.provider,
        language: item.language,
        type: item.type,
      })
    })

    event.target.value = ''
  }

  const handleCreateProject = (payload: Parameters<typeof createProject>[0]) => {
    const created = createProject(payload)
    CollaborationWorkspaceService.createVersion({
      entityType: 'project',
      entityId: created.id,
      authorId: actorId,
      authorName: actorName,
      comment: 'Project created',
      changeSummary: 'Initial project version',
      snapshot: JSON.stringify(created, null, 2),
      projectId: created.id,
    })
  }

  const handleActionConfirm = () => {
    if (!pendingProjectId) return
    if (pendingAction === 'delete') {
      deleteProject(pendingProjectId)
    }
    if (pendingAction === 'archive') {
      archiveProject(pendingProjectId)
      CollaborationWorkspaceService.transitionWorkflow({
        entityType: 'project',
        entityId: pendingProjectId,
        action: 'archive',
        actorId,
        actorName,
        projectId: pendingProjectId,
      })
    }
    if (pendingAction === 'duplicate') {
      duplicateProject(pendingProjectId)
    }
    setPendingAction(null)
    setPendingProjectId(null)
  }

  const cancelPendingAction = () => {
    setPendingAction(null)
    setPendingProjectId(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Projects" description="Gérez vos projets IA et vos workflows." />
        <WorkspaceSkeleton variant="projects" description="Chargement des projets, filtres et indicateurs du workspace." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Gérez vos projets IA, suivez les indicateurs clés et organisez votre travail."
        actions={
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="rounded-3xl bg-[var(--lagoon-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
          >
            Nouveau projet
          </button>
        }
      />

      <ProjectStatistics projects={projects} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_auto]">
            <ProjectSearch
              value={filters.query}
              onSearch={(value) => applyFilters({ query: value })}
              onValueChange={(value) => applyFilters({ query: value })}
            />
            <ProjectToolbar
              filters={filters}
              onToggleView={() => applyFilters({ viewMode: filters.viewMode === 'grid' ? 'list' : 'grid' })}
              onSortChange={(sortKey) => applyFilters({ sortKey })}
              onCreate={() => setWizardOpen(true)}
              actions={
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => refresh()}
                    className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
                  >
                    Actualiser
                  </button>
                  <button
                    type="button"
                    onClick={exportProjects}
                    className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
                  >
                    Exporter
                  </button>
                  <label className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]">
                    Importer
                    <input type="file" accept="application/json" className="hidden" onChange={importProjects} />
                  </label>
                </div>
              }
            />
          </div>

          <ProjectFilters filters={filters} onFilterChange={applyFilters} />

          {filteredProjects.length === 0 ? (
            <EmptyProjects
              action={
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="rounded-3xl bg-[var(--lagoon-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
                >
                  Créer un premier projet
                </button>
              }
            />
          ) : filters.viewMode === 'grid' ? (
            <ProjectGrid
              projects={filteredProjects}
              onSelect={(id) => selectProject(id)}
              onFavorite={(id) => favoriteProject(id)}
            />
          ) : (
            <ProjectList
              projects={filteredProjects}
              onSelect={(id) => selectProject(id)}
              onFavorite={(id) => favoriteProject(id)}
            />
          )}
        </div>

        <div className="space-y-6">
          <ProjectDetailsPanel project={selectedProject} />
          {selectedProject ? (
            <CollaborationWorkspacePanel
              entityType="project"
              entityId={selectedProject.id}
              projectId={selectedProject.id}
              actorId={actorId}
              actorName={actorName}
              users={availableUsers}
              snapshot={JSON.stringify(selectedProject, null, 2)}
            />
          ) : null}
          {selectedProject ? (
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Actions projet</p>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => favoriteProject(selectedProject.id)}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
                >
                  {selectedProject.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </button>
                <div className="grid gap-2">
                  <input
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    placeholder="Renommer le projet"
                    className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--sea-ink)]"
                  />
                  <button
                    type="button"
                    onClick={renameSelectedProject}
                    className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
                  >
                    Renommer
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPendingProjectId(selectedProject.id)
                    setPendingAction('duplicate')
                  }}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
                >
                  Dupliquer
                </button>
                <button
                  type="button"
                  onClick={shareProject}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
                >
                  Partager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingProjectId(selectedProject.id)
                    setPendingAction('archive')
                  }}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
                >
                  Archiver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingProjectId(selectedProject.id)
                    setPendingAction('delete')
                  }}
                  className="rounded-3xl bg-[rgba(223,78,78,0.12)] px-4 py-3 text-sm font-semibold text-[#9b2f2f] transition hover:bg-[rgba(223,78,78,0.18)]"
                >
                  Supprimer
                </button>
                {shareLink ? <p className="text-xs text-[var(--sea-ink-soft)]">Lien de partage: {shareLink}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {wizardOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-[2rem] bg-[var(--surface)] p-6 shadow-[0_36px_68px_rgba(13,30,14,0.36)]">
            <ProjectCreateWizard
              onCreate={handleCreateProject}
              onClose={() => setWizardOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {pendingAction === 'delete' && pendingProjectId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md">
            <DeleteProjectDialog
              projectName={projectName}
              onConfirm={handleActionConfirm}
              onCancel={cancelPendingAction}
            />
          </div>
        </div>
      ) : null}

      {pendingAction === 'archive' && pendingProjectId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md">
            <ArchiveProjectDialog
              projectName={projectName}
              onConfirm={handleActionConfirm}
              onCancel={cancelPendingAction}
            />
          </div>
        </div>
      ) : null}

      {pendingAction === 'duplicate' && pendingProjectId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md">
            <DuplicateProjectDialog
              projectName={projectName}
              onConfirm={handleActionConfirm}
              onCancel={cancelPendingAction}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
