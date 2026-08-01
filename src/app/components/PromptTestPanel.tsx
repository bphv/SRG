import { useEffect, useMemo, useState } from 'react'
import type { Prompt, PromptVariable, PromptProvider } from '#/app/services/PromptService'
import { OpenAIModels } from '#/providers/openai/OpenAIModels'
import type { OpenAIModel } from '#/providers/openai/OpenAIModels'

const providers: PromptProvider[] = ['OpenAI', 'Anthropic', 'Azure OpenAI', 'Cohere']
const models: OpenAIModel[] = [OpenAIModels.GPT_4_1, OpenAIModels.GPT_5, OpenAIModels.GPT_5_MINI, OpenAIModels.GPT_5_5, OpenAIModels.O4_MINI]

export default function PromptTestPanel({
  prompt,
  values,
  onChangeValues,
  onRun,
  status,
  result,
  error,
}: {
  prompt: Prompt | null
  values: Record<string, string>
  onChangeValues: (name: string, value: string) => void
  onRun: (provider: PromptProvider, model: string) => void
  status: 'idle' | 'running' | 'success' | 'error'
  result: string
  error: string | null
}) {
  const [selectedProvider, setSelectedProvider] = useState<PromptProvider>('OpenAI')
  const [selectedModel, setSelectedModel] = useState<string>(OpenAIModels.GPT_4_1)

  useEffect(() => {
    if (prompt) {
      setSelectedProvider(prompt.provider)
      setSelectedModel(prompt.model)
    }
  }, [prompt])

  const availableVariables = useMemo<PromptVariable[]>(() => prompt?.versions[0]?.variables ?? [], [prompt])

  const handleRun = () => {
    if (!prompt) return
    onRun(selectedProvider, selectedModel)
  }

  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Test prompt</p>
          <p className="text-sm text-[var(--srg-text-muted)]">Exécutez votre prompt avec un provider et un modèle.</p>
        </div>
        <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{status}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-[var(--srg-text-title)]">Provider</label>
          <select
            value={selectedProvider}
            onChange={(event) => setSelectedProvider(event.target.value as PromptProvider)}
            className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
          >
            {providers.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--srg-text-title)]">Modèle</label>
          <select
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
          >
            {models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
        <p className="text-sm font-semibold text-[var(--srg-text-title)]">Variables d’exécution</p>
        <div className="mt-4 grid gap-4">
          {availableVariables.length === 0 ? (
            <p className="text-sm text-[var(--srg-text-muted)]">Aucune variable définie pour le prompt sélectionné.</p>
          ) : (
            availableVariables.map((variable) => (
              <div key={variable.name} className="grid gap-2">
                <label className="text-sm text-[var(--srg-text-title)]">{`{{${variable.name}}}`}</label>
                <input
                  value={values[variable.name] ?? ''}
                  onChange={(event) => onChangeValues(variable.name, event.target.value)}
                  className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
                  placeholder={variable.example}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleRun}
        disabled={!prompt}
        className="mt-5 rounded-3xl bg-[var(--srg-color-primary-500)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Exécuter
      </button>

      {result ? (
        <div className="mt-4 rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-title)]">
          <p className="font-semibold text-[var(--srg-text-title)]">Réponse</p>
          <pre className="mt-3 whitespace-pre-wrap break-words">{result}</pre>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-[1.75rem] border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] p-4 text-sm text-[#9b2f2f]">
          <p className="font-semibold">Erreur</p>
          <pre className="mt-2 whitespace-pre-wrap break-words">{error}</pre>
        </div>
      ) : null}
    </div>
  )
}
