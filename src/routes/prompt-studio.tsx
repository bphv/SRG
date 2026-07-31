import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
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
import { useProjects } from '#/app/hooks/useProjects'
import { usePrompts } from '#/app/hooks/usePrompts'
import { runPromptTest } from '#/app/services/PromptTestService'

export const Route = createFileRoute('/prompt-studio')({
  component: PromptStudioPage,
})

function PromptStudioPage() {
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
    filters,
    applyFilters,
  } = usePrompts()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [testValues, setTestValues] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string>('')
  const [testError, setTestError] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')

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
    }
  }

  const handleChangeVariable = (name: string, value: string) => {
    setTestValues((current) => ({ ...current, [name]: value }))
  }

  const handleCreatePrompt = (payload: Parameters<typeof createPrompt>[0]) => {
    const prompt = createPrompt(payload)
    selectPrompt(prompt.id)
    setWizardOpen(false)
  }

  const currentProjectId = selectedProject?.id ?? 'all'

  return (
    <div className="space-y-6">
      <PageHeader title="Prompt Studio" description="Composez, gérez et testez vos prompts prompt engineering." />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_minmax(620px,1.4fr)_0.85fr]">
        <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Explorateur</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">Prompts et projets</h2>
            </div>
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
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
              className="w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
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
            <PromptList
              prompts={visiblePrompts}
              onSelect={(id) => selectPrompt(id)}
              onFavorite={(id) => favoritePrompt(id)}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Éditeur</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">Détails du prompt</h2>
            </div>
            {selectedPrompt ? (
              <PromptActionsMenu
                onDuplicate={() => duplicatePrompt(selectedPrompt.id)}
                onArchive={() => archivePrompt(selectedPrompt.id)}
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
        </div>
      </div>

      <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Test et versioning</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">Exécution de prompt</h2>
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
