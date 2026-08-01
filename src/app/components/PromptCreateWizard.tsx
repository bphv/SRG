import { useMemo, useState } from 'react'
import type { PromptCreatePayload, PromptCategory, PromptProvider, PromptLanguage } from '#/app/services/PromptService'
import { OpenAIModels } from '#/providers/openai/OpenAIModels'
import type { OpenAIModel } from '#/providers/openai/OpenAIModels'

const categories: PromptCategory[] = ['summary', 'onboarding', 'research', 'marketing', 'utility']
const providers: PromptProvider[] = ['OpenAI', 'Anthropic', 'Azure OpenAI', 'Cohere']
const languages: PromptLanguage[] = ['Français', 'English', 'Español', 'Deutsch']
const models: OpenAIModel[] = [OpenAIModels.GPT_4_1, OpenAIModels.GPT_5, OpenAIModels.GPT_5_MINI, OpenAIModels.GPT_5_5, OpenAIModels.O4_MINI]

export default function PromptCreateWizard({
  projects,
  onCreate,
  onClose,
}: {
  projects: { id: string; name: string }[]
  onCreate: (payload: PromptCreatePayload) => void
  onClose: () => void
}) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [category, setCategory] = useState<PromptCategory>('summary')
  const [description, setDescription] = useState('')
  const [provider, setProvider] = useState<PromptProvider>('OpenAI')
  const [model, setModel] = useState<OpenAIModel>(OpenAIModels.GPT_4_1)
  const [language, setLanguage] = useState<PromptLanguage>('Français')
  const [content, setContent] = useState('')
  const [variables] = useState([{ name: 'projectName', description: 'Nom du projet', example: 'SRG Launch', required: true }])

  const isStepOneValid = useMemo(() => name.trim().length > 0 && projectId.length > 0, [name, projectId])
  const isStepTwoValid = useMemo(() => category.length > 0 && description.trim().length > 0, [category, description])
  const isStepThreeValid = useMemo(() => content.trim().length > 0, [content])

  const handleNext = () => {
    if (step === 1 && isStepOneValid) {
      setStep(2)
      return
    }
    if (step === 2 && isStepTwoValid) {
      setStep(3)
      return
    }
    if (step === 3 && isStepThreeValid) {
      setStep(4)
      return
    }
    if (step === 4) {
      onCreate({
        projectId,
        name,
        description,
        category,
        tags: [],
        content,
        provider,
        model,
        language,
        variables: variables.map((variable) => ({ ...variable, value: '' })),
      })
      onClose()
    }
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Assistant de création</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">Étape {step} / 4</h2>
      </div>

      {step === 1 ? (
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold text-[var(--srg-text-title)]">Nom du prompt</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--srg-text-title)]">Projet associé</label>
            <select
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold text-[var(--srg-text-title)]">Catégorie</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as PromptCategory)}
              className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--srg-text-title)]">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full min-h-[120px] rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            />
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-[var(--srg-text-title)]">Provider</label>
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value as PromptProvider)}
                className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
              >
                {providers.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--srg-text-title)]">Langue</label>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as PromptLanguage)}
                className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
              >
                {languages.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-[var(--srg-text-title)]">Modèle</label>
              <select
                value={model}
                onChange={(event) => setModel(event.target.value as OpenAIModel)}
                className="mt-2 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
              >
                {models.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--srg-text-title)]">Variables</label>
              <div className="mt-2 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)]">
                {variables.map((variable) => variable.name).join(', ')}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--srg-text-title)]">Prompt</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="mt-2 w-full min-h-[160px] rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-4 text-sm text-[var(--srg-text-title)] outline-none font-mono"
            />
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 text-sm text-[var(--srg-text-muted)]">
          <p className="font-semibold text-[var(--srg-text-title)]">Validation</p>
          <p className="mt-3">Nom : {name}</p>
          <p>Projet : {projects.find((project) => project.id === projectId)?.name ?? 'Aucun'}</p>
          <p>Catégorie : {category}</p>
          <p>Description : {description}</p>
          <p>Provider : {provider}</p>
          <p>Langue : {language}</p>
          <p>Model : {model}</p>
          <p className="mt-3">Prompt : {content ? 'Prêt' : 'Vide'}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onClose}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:bg-[var(--srg-surface)]"
        >
          Fermer
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={
            (step === 1 && !isStepOneValid) ||
            (step === 2 && !isStepTwoValid) ||
            (step === 3 && !isStepThreeValid)
          }
          className="rounded-3xl bg-[var(--srg-color-primary-500)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {step === 4 ? 'Créer le prompt' : 'Suivant'}
        </button>
      </div>
    </div>
  )
}
