import { useMemo, useState } from 'react'
import type { ProjectCreatePayload, ProjectProvider, ProjectType } from '#/app/services/ProjectService'

const providers: ProjectProvider[] = ['OpenAI', 'Anthropic', 'Azure OpenAI', 'Cohere']
const types: ProjectType[] = ['content', 'research', 'product']
const languages = ['Français', 'English', 'Español']

export default function ProjectCreateWizard({
  onCreate,
  onClose,
}: {
  onCreate: (payload: ProjectCreatePayload) => void
  onClose: () => void
}) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [provider, setProvider] = useState<ProjectProvider>('OpenAI')
  const [language, setLanguage] = useState('Français')
  const [type, setType] = useState<ProjectType>('product')

  const isStepOneValid = useMemo(() => name.trim().length > 0 && description.trim().length > 0, [name, description])
  const isStepTwoValid = useMemo(() => provider.length > 0 && language.length > 0 && type.length > 0, [provider, language, type])

  const handleNext = () => {
    if (step === 1 && isStepOneValid) {
      setStep(2)
      return
    }

    if (step === 2 && isStepTwoValid) {
      setStep(3)
      return
    }

    if (step === 3) {
      onCreate({ name, description, provider, language, type })
      onClose()
    }
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Assistant de création</p>
        <h2 className="text-2xl font-semibold text-[var(--sea-ink)]">Étape {step} / 3</h2>
      </div>

      {step === 1 ? (
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--sea-ink)]">Nom du projet</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--sea-ink)]">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
              rows={4}
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-[var(--sea-ink)]">Provider par défaut</label>
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value as ProjectProvider)}
              className="mt-2 w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            >
              {providers.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--sea-ink)]">Langue</label>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--sea-ink)]">Type de projet</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ProjectType)}
              className="mt-2 w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            >
              {types.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 text-sm text-[var(--sea-ink-soft)]">
          <p className="font-semibold text-[var(--sea-ink)]">Résumé</p>
          <div className="mt-4 space-y-3">
            <p><span className="font-semibold text-[var(--sea-ink)]">Nom :</span> {name}</p>
            <p><span className="font-semibold text-[var(--sea-ink)]">Description :</span> {description}</p>
            <p><span className="font-semibold text-[var(--sea-ink)]">Provider :</span> {provider}</p>
            <p><span className="font-semibold text-[var(--sea-ink)]">Langue :</span> {language}</p>
            <p><span className="font-semibold text-[var(--sea-ink)]">Type :</span> {type}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onClose}
          className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--surface)]"
        >
          Fermer
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={(step === 1 && !isStepOneValid) || (step === 2 && !isStepTwoValid)}
          className="rounded-3xl bg-[var(--lagoon-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--palm)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {step === 3 ? 'Créer le projet' : 'Suivant'}
        </button>
      </div>
    </div>
  )
}
