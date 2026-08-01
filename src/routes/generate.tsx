import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import PromptEditor from '#/app/components/PromptEditor'
import PromptList from '#/app/components/PromptList'
import PromptSearch from '#/app/components/PromptSearch'
import PromptVariablesPanel from '#/app/components/PromptVariablesPanel'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useNotifications } from '#/app/hooks/useNotifications'
import { usePrompts } from '#/app/hooks/usePrompts'
import { useProjects } from '#/app/hooks/useProjects'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import type { WorkspaceHistoryRecord } from '#/app/services/HistoryWorkspaceService'
import type { Prompt, PromptProvider } from '#/app/services/PromptService'
import { replaceVariables } from '#/app/services/PromptPreviewService'
import { GeneratorEngine } from '#/generator/engine/GeneratorEngine'
import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import { ExecutionEngine } from '#/execution/engine/ExecutionEngine'
import { ProviderRegistry } from '#/providers/registry/ProviderRegistry'
import { ProviderResolver } from '#/providers/resolver/ProviderResolver'
import { OpenAIProviderFactory } from '#/providers/openai/OpenAIProviderFactory'
import { MockProviderFactory } from '#/providers/mock/MockProviderFactory'
import { OpenAIModels } from '#/providers/openai/OpenAIModels'
import type { IProvider } from '#/providers/interfaces/IProvider'

export const Route = createFileRoute('/generate')({
  component: GeneratePage,
})

type ProviderChoice = 'auto' | 'openai' | 'mock'
type OutputFormat = 'markdown' | 'json' | 'raw'
type MobilePane = 'config' | 'prompt' | 'result'

function GeneratePage() {
  const business = useBusiness()
  const notifications = useNotifications()
  const { prompts, createPrompt, updatePrompt, favoritePrompt } = usePrompts()
  const { projects, selectedProject } = useProjects()

  const [search, setSearch] = useState('')
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(prompts[0]?.id ?? null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [workingPrompt, setWorkingPrompt] = useState<Prompt | null>(prompts[0] ? clonePrompt(prompts[0]) : null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [providerChoice, setProviderChoice] = useState<ProviderChoice>('auto')
  const [model, setModel] = useState<string>(OpenAIModels.GPT_4_1)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1200)
  const [topP, setTopP] = useState(1)
  const [topK, setTopK] = useState(40)
  const [seed, setSeed] = useState(42)
  const [streaming, setStreaming] = useState(true)
  const [jsonMode, setJsonMode] = useState(false)
  const [visionEnabled, setVisionEnabled] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [imageEnabled, setImageEnabled] = useState(false)

  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [resultOutput, setResultOutput] = useState('')
  const [resultError, setResultError] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('markdown')
  const [mobilePane, setMobilePane] = useState<MobilePane>('prompt')
  const [lastUsedProvider, setLastUsedProvider] = useState('mock')

  const [streamBuffer, setStreamBuffer] = useState('')
  const [streamChunks, setStreamChunks] = useState<string[]>([])
  const [streamCursor, setStreamCursor] = useState(0)
  const [isStreamingActive, setIsStreamingActive] = useState(false)
  const [isStreamingPaused, setIsStreamingPaused] = useState(false)
  const streamTimerRef = useRef<number | null>(null)

  const [history, setHistory] = useState<WorkspaceHistoryRecord[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [quickPromptName, setQuickPromptName] = useState('')
  const activeUserId = business.currentSession?.userId ?? business.snapshot.users[0]?.id
  const activeProfile = activeUserId ? business.getUserProfileSnapshot(activeUserId) : undefined

  useEffect(() => {
    if (!selectedPromptId) return
    const prompt = prompts.find((item) => item.id === selectedPromptId)
    if (!prompt) return

    const cloned = clonePrompt(prompt)
    setWorkingPrompt(cloned)
    setVariableValues(buildVariableValues(cloned))
  }, [selectedPromptId, prompts])

  useEffect(() => {
    setHistory(HistoryWorkspaceService.getRecords())
  }, [])

  useEffect(() => {
    const rerunDraft = HistoryWorkspaceService.consumePendingRerun()
    if (!rerunDraft) {
      return
    }

    const importedPrompt = buildFallbackPrompt()
    importedPrompt.name = rerunDraft.promptName
    importedPrompt.content = rerunDraft.promptText
    importedPrompt.model = rerunDraft.model

    setWorkingPrompt(importedPrompt)
    setSelectedPromptId(null)
    setProviderChoice(rerunDraft.provider === 'openai' ? 'openai' : rerunDraft.provider === 'mock' ? 'mock' : 'auto')
    setModel(rerunDraft.model)
  }, [])

  useEffect(() => {
    return () => {
      clearStreamingTimer(streamTimerRef)
    }
  }, [])

  const filteredPrompts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return prompts
      .filter((prompt) => prompt.status !== 'archived')
      .filter((prompt) => {
        if (!query) return true
        return (
          prompt.name.toLowerCase().includes(query) ||
          prompt.description.toLowerCase().includes(query) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          prompt.category.toLowerCase().includes(query)
        )
      })
  }, [prompts, search])

  const templateCandidates = useMemo(
    () => prompts.filter((prompt) => prompt.favorite || prompt.status === 'draft' || prompt.tags.length > 1),
    [prompts],
  )

  const renderedPrompt = useMemo(() => {
    if (!workingPrompt) return ''
    return replaceVariables(workingPrompt.content, variableValues)
  }, [workingPrompt, variableValues])

  const observability = useMemo(() => {
    const latest = history.at(0)
    if (!latest) {
      return {
        durationMs: 0,
        provider: '-',
        model: '-',
        costEstimate: 0,
        tokensTotal: 0,
        status: 'idle',
      }
    }

    return {
      durationMs: latest.durationMs,
      provider: latest.provider,
      model: latest.model,
      costEstimate: latest.costEstimate,
      tokensTotal: latest.tokensInput + latest.tokensOutput,
      status: latest.status,
    }
  }, [history])

  const displayOutput = useMemo(() => {
    if (streaming && isStreamingActive) {
      return streamBuffer
    }
    return resultOutput
  }, [streaming, isStreamingActive, streamBuffer, resultOutput])

  const jsonOutput = useMemo(
    () =>
      JSON.stringify(
        {
          prompt: workingPrompt?.name ?? 'Untitled',
          provider: lastUsedProvider,
          model,
          status,
          output: displayOutput,
        },
        null,
        2,
      ),
    [workingPrompt?.name, lastUsedProvider, model, status, displayOutput],
  )

  const previousOutput = history[1]?.output ?? ''

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const templatePrompt = prompts.find((prompt) => prompt.id === templateId)
    if (!templatePrompt) return
    const cloned = clonePrompt(templatePrompt)
    setWorkingPrompt(cloned)
    setVariableValues(buildVariableValues(cloned))
  }

  const handlePromptUpdate = (updates: Partial<Prompt>) => {
    if (!workingPrompt) return
    setWorkingPrompt({ ...workingPrompt, ...updates })
  }

  const validateBeforeGenerate = (): string[] => {
    const errors: string[] = []
    if (!workingPrompt) {
      errors.push('Sélectionnez ou créez un prompt avant de lancer la génération.')
      return errors
    }

    if (!workingPrompt.content || workingPrompt.content.trim().length === 0) {
      errors.push('Le contenu du prompt est vide.')
    }

    const requiredVariables = workingPrompt.versions[0]?.variables.filter((variable) => variable.required) ?? []
    const missing = requiredVariables.filter((variable) => !(variableValues[variable.name] ?? '').trim())
    if (missing.length > 0) {
      errors.push(`Variables obligatoires manquantes: ${missing.map((item) => item.name).join(', ')}`)
    }

    return errors
  }

  const handleGenerate = async () => {
    const errors = validateBeforeGenerate()
    setValidationErrors(errors)

    if (errors.length > 0) {
      setStatus('error')
      setResultError(errors.join(' | '))
      return
    }

    if (!workingPrompt) {
      return
    }

    setStatus('running')
    setResultError(null)
    setShowCompare(false)

    const startTime = Date.now()

    try {
      const response = await executeGeneration({
        renderedPrompt,
        selectedModel: model,
        providerChoice,
        temperature,
        maxTokens,
        topP,
        topK,
        seed,
        streaming,
        jsonMode,
      })

      const durationMs = Date.now() - startTime
      const output = response.output

      setLastUsedProvider(response.providerId)
      setResultOutput(output)

      if (streaming) {
        startStreamingOutput(output, setStreamBuffer, setStreamChunks, setStreamCursor, setIsStreamingActive, setIsStreamingPaused, streamTimerRef)
      }

      setStatus('success')

      const tokensInput = Math.max(8, Math.ceil(renderedPrompt.length / 4))
      const tokensOutput = Math.max(12, Math.ceil(output.length / 4))
      const costEstimate = Number(((tokensInput + tokensOutput) * 0.000002).toFixed(6))

      const entry: WorkspaceHistoryRecord = {
        id: `history-${Date.now()}`,
        promptName: workingPrompt.name,
        promptText: renderedPrompt,
        output,
        provider: response.providerId,
        model,
        status: 'completed',
        durationMs,
        tokensInput,
        tokensOutput,
        costEstimate,
        createdAt: new Date().toISOString(),
        requestKind: 'generation',
        projectId: selectedProject?.id,
        projectName: selectedProject?.name,
      }

      HistoryWorkspaceService.addRecord(entry)
      setHistory(HistoryWorkspaceService.getRecords())
      notifications.publish({
        title: 'Generation terminee',
        message: `${workingPrompt.name} est disponible dans l'historique.`,
        level: 'success',
        priority: 'medium',
        category: 'generation',
        read: false,
        channels: ['email', 'whatsapp'],
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      setStatus('error')
      setResultError(message)
      setResultOutput('')
      clearStreamingTimer(streamTimerRef)
      setIsStreamingActive(false)
      setIsStreamingPaused(false)
    }
  }

  const handleStopStreaming = () => {
    clearStreamingTimer(streamTimerRef)
    setIsStreamingPaused(true)
  }

  const handleResumeStreaming = () => {
    if (!isStreamingPaused || streamChunks.length === 0) return
    resumeStreamingOutput(streamChunks, setStreamBuffer, setStreamCursor, setIsStreamingActive, setIsStreamingPaused, streamTimerRef)
  }

  const handleCopy = async () => {
    const text = displayOutput
    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  const handleDownload = () => {
    if (!displayOutput) return
    const blob = new Blob([displayOutput], { type: jsonMode ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `generation-${Date.now()}.${jsonMode ? 'json' : 'txt'}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleRetry = async () => {
    await handleGenerate()
  }

  const handleSavePrompt = () => {
    if (!workingPrompt || !workingPrompt.content.trim()) {
      return
    }

    const projectId = selectedProject?.id ?? projects.at(0)?.id ?? 'project-1'
    const providerForPrompt: PromptProvider = providerChoice === 'mock' ? 'OpenAI' : 'OpenAI'

    if (prompts.some((prompt) => prompt.id === workingPrompt.id)) {
      updatePrompt(workingPrompt.id, {
        content: workingPrompt.content,
        description: workingPrompt.description,
        tags: workingPrompt.tags,
        versionComment: 'Saved from Generate workspace',
      })
      return
    }

    createPrompt({
      projectId,
      name: quickPromptName.trim() || workingPrompt.name || 'Quick Prompt',
      description: workingPrompt.description || 'Saved from AI Generation Workspace',
      category: 'utility',
      tags: workingPrompt.tags,
      content: workingPrompt.content,
      provider: providerForPrompt,
      model,
      language: 'Français',
      variables: workingPrompt.versions[0]?.variables ?? [],
    })
  }

  const handleDeleteResult = () => {
    setResultOutput('')
    setResultError(null)
    setStatus('idle')
    setStreamBuffer('')
    setStreamChunks([])
    setStreamCursor(0)
    clearStreamingTimer(streamTimerRef)
    setIsStreamingActive(false)
    setIsStreamingPaused(false)
  }

  const createQuickPrompt = () => {
    const base = clonePrompt(prompts[0] ?? buildFallbackPrompt())
    const name = quickPromptName.trim() || `Quick prompt ${new Date().toLocaleTimeString()}`
    const nextPrompt: Prompt = {
      ...base,
      id: `quick-${Date.now()}`,
      name,
      description: 'Prompt rapide en cours de préparation.',
      content: base.content || 'Rédige un message clair et structuré pour {{topic}}.',
      tags: ['quick'],
      status: 'draft',
      versions: [
        {
          id: `quick-${Date.now()}-v1`,
          version: 1,
          date: new Date().toISOString().split('T')[0],
          author: 'Generate Workspace',
          comment: 'Quick prompt draft',
          content: base.content || 'Rédige un message clair et structuré pour {{topic}}.',
          variables: [{ name: 'topic', description: 'Sujet principal', example: 'SRG Release', required: true }],
        },
      ],
    }
    setWorkingPrompt(nextPrompt)
    setVariableValues({ topic: '' })
    setValidationErrors([])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate"
        description="AI Generation Workspace: configurez, générez, comparez et sauvegardez vos sorties IA."
        actions={
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-3xl bg-[var(--lagoon-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
            aria-label="Lancer la génération"
          >
            Generate
          </button>
        }
      />

      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-4 lg:hidden">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMobilePane('config')}
            className={`rounded-2xl px-3 py-2 font-semibold ${mobilePane === 'config' ? 'bg-[var(--lagoon-deep)] text-white' : 'bg-[var(--surface-strong)] text-[var(--sea-ink)]'}`}
          >
            Configuration
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('prompt')}
            className={`rounded-2xl px-3 py-2 font-semibold ${mobilePane === 'prompt' ? 'bg-[var(--lagoon-deep)] text-white' : 'bg-[var(--surface-strong)] text-[var(--sea-ink)]'}`}
          >
            Prompt
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('result')}
            className={`rounded-2xl px-3 py-2 font-semibold ${mobilePane === 'result' ? 'bg-[var(--lagoon-deep)] text-white' : 'bg-[var(--surface-strong)] text-[var(--sea-ink)]'}`}
          >
            Résultat
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_420px]">
        <section className={`${mobilePane === 'config' ? 'block' : 'hidden'} space-y-6 xl:block`}>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <h2 className="text-lg font-semibold text-[var(--sea-ink)]">Configuration</h2>
            <div className="mt-5 space-y-4 text-sm text-[var(--sea-ink-soft)]">
              <label className="grid gap-2">
                <span className="font-semibold text-[var(--sea-ink)]">Provider</span>
                <select
                  value={providerChoice}
                  onChange={(event) => setProviderChoice(event.target.value as ProviderChoice)}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                  aria-label="Provider"
                >
                  <option value="auto">Auto (best available)</option>
                  <option value="openai">OpenAI</option>
                  <option value="mock">Mock</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-semibold text-[var(--sea-ink)]">Modèle</span>
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                  aria-label="Modèle"
                >
                  {Object.values(OpenAIModels).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-semibold text-[var(--sea-ink)]">Température: {temperature.toFixed(2)}</span>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={temperature}
                  onChange={(event) => setTemperature(Number(event.target.value))}
                />
              </label>

              <label className="grid gap-2">
                <span className="font-semibold text-[var(--sea-ink)]">Max tokens</span>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(event) => setMaxTokens(Number(event.target.value))}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-semibold text-[var(--sea-ink)]">Top P</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={topP}
                  onChange={(event) => setTopP(Number(event.target.value))}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-semibold text-[var(--sea-ink)]">Top K</span>
                <input
                  type="number"
                  min={1}
                  value={topK}
                  onChange={(event) => setTopK(Number(event.target.value))}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-semibold text-[var(--sea-ink)]">Seed</span>
                <input
                  type="number"
                  value={seed}
                  onChange={(event) => setSeed(Number(event.target.value))}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                />
              </label>

              <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--surface-strong)] px-4 py-3">
                <input type="checkbox" checked={streaming} onChange={(event) => setStreaming(event.target.checked)} />
                <span>Streaming</span>
              </label>

              <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--surface-strong)] px-4 py-3">
                <input type="checkbox" checked={jsonMode} onChange={(event) => setJsonMode(event.target.checked)} />
                <span>JSON Mode</span>
              </label>

              <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--surface-strong)] px-4 py-3">
                <input type="checkbox" checked={visionEnabled} onChange={(event) => setVisionEnabled(event.target.checked)} />
                <span>Vision</span>
              </label>

              <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--surface-strong)] px-4 py-3">
                <input type="checkbox" checked={audioEnabled} onChange={(event) => setAudioEnabled(event.target.checked)} />
                <span>Audio</span>
              </label>

              <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--surface-strong)] px-4 py-3">
                <input type="checkbox" checked={imageEnabled} onChange={(event) => setImageEnabled(event.target.checked)} />
                <span>Image</span>
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Prompts</h3>
            <div className="mt-4 space-y-4">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Choisir un prompt existant</span>
                <select
                  value={selectedPromptId ?? ''}
                  onChange={(event) => setSelectedPromptId(event.target.value || null)}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                >
                  {filteredPrompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>{prompt.name}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Choisir un template</span>
                <select
                  value={selectedTemplateId}
                  onChange={(event) => handleUseTemplate(event.target.value)}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                >
                  <option value="">Sélectionner</option>
                  {templateCandidates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Prompt rapide</span>
                <input
                  value={quickPromptName}
                  onChange={(event) => setQuickPromptName(event.target.value)}
                  placeholder="Nom du prompt rapide"
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)]"
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={createQuickPrompt}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)]"
                >
                  Créer prompt rapide
                </button>
                <button
                  type="button"
                  onClick={handleSavePrompt}
                  className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={`${mobilePane === 'prompt' ? 'block' : 'hidden'} space-y-6 xl:block`}>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <PromptSearch value={search} onSearch={setSearch} onValueChange={setSearch} />
          </div>

          <PromptList
            prompts={filteredPrompts.slice(0, 6)}
            onSelect={(id) => setSelectedPromptId(id)}
            onFavorite={(id) => favoritePrompt(id)}
          />

          <PromptEditor prompt={workingPrompt} onChange={handlePromptUpdate} />

          <PromptVariablesPanel
            variables={workingPrompt?.versions[0]?.variables ?? []}
            onChange={(name, value) => setVariableValues((current) => ({ ...current, [name]: value }))}
          />

          {validationErrors.length > 0 ? (
            <div className="rounded-[1.75rem] border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] p-4 text-sm text-[#9b2f2f]" role="alert">
              <p className="font-semibold">Validation</p>
              <ul className="mt-2 list-disc pl-5">
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className={`${mobilePane === 'result' ? 'block' : 'hidden'} space-y-6 xl:block`}>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--sea-ink)]">Résultat</h2>
              <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--sea-ink-soft)]">{status}</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setOutputFormat('markdown')}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold ${outputFormat === 'markdown' ? 'bg-[var(--lagoon-deep)] text-white' : 'bg-[var(--surface-strong)] text-[var(--sea-ink)]'}`}
              >
                Markdown
              </button>
              <button
                type="button"
                onClick={() => setOutputFormat('json')}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold ${outputFormat === 'json' ? 'bg-[var(--lagoon-deep)] text-white' : 'bg-[var(--surface-strong)] text-[var(--sea-ink)]'}`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setOutputFormat('raw')}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold ${outputFormat === 'raw' ? 'bg-[var(--lagoon-deep)] text-white' : 'bg-[var(--surface-strong)] text-[var(--sea-ink)]'}`}
              >
                Brut
              </button>
            </div>

            <div className="mt-4 rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
              {outputFormat === 'json' ? (
                <pre className="whitespace-pre-wrap break-words text-sm text-[var(--sea-ink)]">{jsonOutput}</pre>
              ) : (
                <pre className="whitespace-pre-wrap break-words text-sm text-[var(--sea-ink)]">{displayOutput || 'Aucun résultat pour le moment.'}</pre>
              )}
            </div>

            {resultError ? (
              <div className="mt-4 rounded-[1.75rem] border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] p-4 text-sm text-[#9b2f2f]" role="alert">
                {resultError}
              </div>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={handleCopy} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)]">Copy</button>
              <button type="button" onClick={handleDownload} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)]">Download</button>
              <button type="button" onClick={handleRetry} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)]">Retry</button>
              <button type="button" onClick={() => setShowCompare((current) => !current)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)]">Compare</button>
              <button type="button" onClick={handleSavePrompt} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)]">Save</button>
              <button type="button" onClick={handleDeleteResult} className="rounded-2xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-3 py-2 text-sm font-semibold text-[#9b2f2f]">Delete</button>
            </div>

            {streaming ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  disabled={!isStreamingActive || isStreamingPaused}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] disabled:opacity-50"
                >
                  Stop
                </button>
                <button
                  type="button"
                  onClick={handleResumeStreaming}
                  disabled={!isStreamingPaused}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] disabled:opacity-50"
                >
                  Resume
                </button>
                <span className="inline-flex items-center rounded-2xl bg-[var(--surface-strong)] px-3 py-2 text-xs text-[var(--sea-ink-soft)]">
                  Stream {Math.min(streamCursor, streamChunks.length)}/{streamChunks.length}
                </span>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Observabilité</h3>
            <div className="mt-4 grid gap-3 text-sm text-[var(--sea-ink-soft)] sm:grid-cols-2">
              <p><span className="font-semibold text-[var(--sea-ink)]">Durée:</span> {observability.durationMs} ms</p>
              <p><span className="font-semibold text-[var(--sea-ink)]">Provider:</span> {observability.provider}</p>
              <p><span className="font-semibold text-[var(--sea-ink)]">Modèle:</span> {observability.model}</p>
              <p><span className="font-semibold text-[var(--sea-ink)]">Coût estimé:</span> ${observability.costEstimate.toFixed(6)}</p>
              <p><span className="font-semibold text-[var(--sea-ink)]">Tokens:</span> {observability.tokensTotal}</p>
              <p><span className="font-semibold text-[var(--sea-ink)]">Statut:</span> {observability.status}</p>
              <p><span className="font-semibold text-[var(--sea-ink)]">Credits utilisateur:</span> {activeProfile?.credits ?? 0}</p>
              <p><span className="font-semibold text-[var(--sea-ink)]">Wallet utilisateur:</span> {activeProfile?.wallet ?? 0}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Historique local</h3>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-[var(--sea-ink-soft)]">Aucune génération enregistrée.</p>
              ) : (
                history.slice(0, 8).map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setResultOutput(entry.output)
                      setLastUsedProvider(entry.provider)
                    }}
                    className="w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-left"
                  >
                    <p className="text-sm font-semibold text-[var(--sea-ink)]">{entry.promptName}</p>
                    <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{entry.provider} / {entry.model} · {entry.durationMs} ms · {entry.tokensInput + entry.tokensOutput} tokens</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {showCompare && previousOutput ? (
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Compare</h3>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <pre className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-3 text-xs text-[var(--sea-ink)] whitespace-pre-wrap">{previousOutput}</pre>
                <pre className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-3 text-xs text-[var(--sea-ink)] whitespace-pre-wrap">{displayOutput}</pre>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function clonePrompt(prompt: Prompt): Prompt {
  return {
    ...prompt,
    tags: [...prompt.tags],
    versions: prompt.versions.map((version) => ({
      ...version,
      variables: version.variables.map((variable) => ({ ...variable })),
    })),
  }
}

function buildVariableValues(prompt: Prompt): Record<string, string> {
  return (prompt.versions[0]?.variables ?? []).reduce<Record<string, string>>((acc, variable) => {
    acc[variable.name] = variable.value ?? ''
    return acc
  }, {})
}

function clearStreamingTimer(ref: React.MutableRefObject<number | null>) {
  if (ref.current !== null) {
    window.clearInterval(ref.current)
    ref.current = null
  }
}

function startStreamingOutput(
  output: string,
  setStreamBuffer: React.Dispatch<React.SetStateAction<string>>,
  setStreamChunks: React.Dispatch<React.SetStateAction<string[]>>,
  setStreamCursor: React.Dispatch<React.SetStateAction<number>>,
  setIsStreamingActive: React.Dispatch<React.SetStateAction<boolean>>,
  setIsStreamingPaused: React.Dispatch<React.SetStateAction<boolean>>,
  streamTimerRef: React.MutableRefObject<number | null>,
) {
  clearStreamingTimer(streamTimerRef)
  const chunks = output.split(/(\s+)/).filter(Boolean)
  setStreamChunks(chunks)
  setStreamCursor(0)
  setStreamBuffer('')
  setIsStreamingActive(chunks.length > 0)
  setIsStreamingPaused(false)

  if (chunks.length === 0) {
    return
  }

  let cursor = 0
  streamTimerRef.current = window.setInterval(() => {
    cursor += 1
    const next = chunks.slice(0, cursor).join('')
    setStreamBuffer(next)
    setStreamCursor(cursor)

    if (cursor >= chunks.length) {
      clearStreamingTimer(streamTimerRef)
      setIsStreamingActive(false)
      setIsStreamingPaused(false)
    }
  }, 28)
}

function resumeStreamingOutput(
  streamChunks: string[],
  setStreamBuffer: React.Dispatch<React.SetStateAction<string>>,
  setStreamCursor: React.Dispatch<React.SetStateAction<number>>,
  setIsStreamingActive: React.Dispatch<React.SetStateAction<boolean>>,
  setIsStreamingPaused: React.Dispatch<React.SetStateAction<boolean>>,
  streamTimerRef: React.MutableRefObject<number | null>,
) {
  if (streamChunks.length === 0) {
    return
  }

  clearStreamingTimer(streamTimerRef)
  let cursor = 0
  setIsStreamingActive(true)
  setIsStreamingPaused(false)

  streamTimerRef.current = window.setInterval(() => {
    cursor += 1
    setStreamBuffer(streamChunks.slice(0, cursor).join(''))
    setStreamCursor(cursor)

    if (cursor >= streamChunks.length) {
      clearStreamingTimer(streamTimerRef)
      setIsStreamingActive(false)
      setIsStreamingPaused(false)
    }
  }, 28)
}

function buildFallbackPrompt(): Prompt {
  return {
    id: 'fallback-prompt',
    projectId: 'project-1',
    name: 'Prompt temporaire',
    description: 'Prompt temporaire pour workspace de génération.',
    category: 'utility',
    tags: ['temporary'],
    content: 'Rédige une synthèse claire de {{topic}}.',
    provider: 'OpenAI',
    model: OpenAIModels.GPT_4_1,
    language: 'Français',
    status: 'draft',
    favorite: false,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    runCount: 0,
    averageLatencyMs: 0,
    lastRunAt: new Date().toISOString().split('T')[0],
    versions: [
      {
        id: 'fallback-prompt-v1',
        version: 1,
        date: new Date().toISOString().split('T')[0],
        author: 'System',
        comment: 'Fallback',
        content: 'Rédige une synthèse claire de {{topic}}.',
        variables: [{ name: 'topic', description: 'Sujet principal', example: 'SRG', required: true }],
      },
    ],
  }
}

async function executeGeneration(params: {
  renderedPrompt: string
  selectedModel: string
  providerChoice: ProviderChoice
  temperature: number
  maxTokens: number
  topP: number
  topK: number
  seed: number
  streaming: boolean
  jsonMode: boolean
}): Promise<{ output: string; providerId: string }> {
  const providers = buildProviders(params.selectedModel)
  const resolver = new ProviderResolver()
  const completionProviders = resolver.resolve(providers, 'completion')

  if (completionProviders.length === 0) {
    throw new Error('Aucun provider compatible completion disponible.')
  }

  let selected: IProvider | undefined
  if (params.providerChoice === 'auto') {
    selected = resolver.resolveBest(completionProviders, 'completion')
  } else {
    selected = completionProviders.find((provider) => provider.id === params.providerChoice)
  }

  if (!selected) {
    throw new Error('Provider sélectionné indisponible.')
  }

  const registry = new ProviderRegistry()
  registry.register(selected)

  const executionEngine = new ExecutionEngine(
    {
      id: 'execution-generate-workspace',
      name: 'Execution Engine Generate Workspace',
      category: 'service',
    },
    {},
    { providerRegistry: registry },
  )

  const generatorEngine = new GeneratorEngine(
    {
      id: 'generator-generate-workspace',
      name: 'Generator Engine Generate Workspace',
      category: 'service',
    },
    {},
    { executionEngine },
  )

  const request: GenerationRequest = {
    id: `gen-${Date.now()}`,
    task: params.renderedPrompt,
    metadata: {
      defaultModel: params.selectedModel,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      topP: params.topP,
      topK: params.topK,
      seed: params.seed,
      streaming: params.streaming,
      jsonMode: params.jsonMode,
      providerChoice: params.providerChoice,
    },
  }

  try {
    const response = await generatorEngine.generate(request)
    const output = response.content ?? ''
    if (response.status === 'failed') {
      throw new Error(response.errors?.join(', ') || response.warnings?.join(', ') || 'Generation failed')
    }
    return { output, providerId: selected.id }
  } catch (error) {
    if (selected.id !== 'mock') {
      const fallback = completionProviders.find((provider) => provider.id === 'mock')
      if (!fallback) {
        throw error
      }

      const fallbackRegistry = new ProviderRegistry()
      fallbackRegistry.register(fallback)

      const fallbackExecution = new ExecutionEngine(
        {
          id: 'execution-generate-fallback',
          name: 'Execution Engine Generate Fallback',
          category: 'service',
        },
        {},
        { providerRegistry: fallbackRegistry },
      )

      const fallbackGenerator = new GeneratorEngine(
        {
          id: 'generator-generate-fallback',
          name: 'Generator Engine Generate Fallback',
          category: 'service',
        },
        {},
        { executionEngine: fallbackExecution },
      )

      const response = await fallbackGenerator.generate(request)
      if (response.status === 'failed') {
        throw new Error(response.errors?.join(', ') || response.warnings?.join(', ') || 'Fallback generation failed')
      }
      return { output: response.content ?? '', providerId: fallback.id }
    }

    throw error
  }
}

function buildProviders(selectedModel: string): IProvider[] {
  const openAI = new OpenAIProviderFactory().create(
    {
      id: 'openai',
      name: 'OpenAI',
      capabilities: ['chat', 'completion', 'streaming', 'jsonMode', 'structuredOutput'],
      priority: 100,
    },
    {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      defaultModel: selectedModel,
    },
  )

  const mock = new MockProviderFactory().create({
    id: 'mock',
    name: 'Mock Provider',
    capabilities: ['chat', 'completion', 'jsonMode', 'structuredOutput'],
    priority: 10,
  })

  return [openAI, mock]
}
