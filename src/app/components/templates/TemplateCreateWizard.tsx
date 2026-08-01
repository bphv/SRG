import { useMemo, useState } from 'react'
import type { TemplateVariable } from '#/app/components/templates/TemplateVariables'

const defaultVariables: TemplateVariable[] = [
  { name: '{{projectName}}', type: 'string', description: 'Nom du projet', defaultValue: 'SRG', },
  { name: '{{user}}', type: 'string', description: 'Nom de l’utilisateur', defaultValue: 'Alex', },
]

export default function TemplateCreateWizard({
  onCreate,
  onCancel,
}: {
  onCreate: (payload: {
    name: string
    category: string
    description: string
    tags: string[]
    variables: TemplateVariable[]
    content: string
  }) => void
  onCancel: () => void
}) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [variables, setVariables] = useState<TemplateVariable[]>(defaultVariables)
  const [content, setContent] = useState('')

  const isStepValid = useMemo(() => {
    if (step === 1) return name.trim().length > 0 && category.trim().length > 0
    if (step === 2) return description.trim().length > 0
    if (step === 3) return content.trim().length > 0
    return true
  }, [step, name, category, description, content])

  const handleNext = () => {
    if (!isStepValid) return
    if (step < 4) {
      setStep((current) => current + 1)
      return
    }

    onCreate({
      name,
      category,
      description,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      variables,
      content,
    })
    onCancel()
  }

  const handleVariableChange = (index: number, key: keyof TemplateVariable, value: string) => {
    setVariables((current) => current.map((variable, idx) => idx === index ? { ...variable, [key]: value } : variable))
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--srg-color-primary-600)]">Assistant de création</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">Étape {step} / 4</h2>
      </div>

      {step === 1 ? (
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[var(--srg-text-title)]">
            Nom
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[var(--srg-text-title)]">
            Catégorie
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[var(--srg-text-title)]">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[120px] rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[var(--srg-text-title)]">
            Tags
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="marketing, ai, onboarding"
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--srg-text-title)]">Variables</p>
            <div className="space-y-4">
              {variables.map((variable, index) => (
                <div key={variable.name} className="grid gap-2 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
                  <input
                    value={variable.name}
                    onChange={(event) => handleVariableChange(index, 'name', event.target.value)}
                    className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
                    placeholder="Nom de la variable"
                  />
                  <input
                    value={variable.type}
                    onChange={(event) => handleVariableChange(index, 'type', event.target.value)}
                    className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
                    placeholder="Type"
                  />
                  <input
                    value={variable.defaultValue ?? ''}
                    onChange={(event) => handleVariableChange(index, 'defaultValue', event.target.value)}
                    className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
                    placeholder="Valeur par défaut"
                  />
                  <textarea
                    value={variable.description}
                    onChange={(event) => handleVariableChange(index, 'description', event.target.value)}
                    className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-[var(--srg-text-title)]">
            Prompt
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-[180px] rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-4 text-sm text-[var(--srg-text-title)] outline-none font-mono"
              placeholder="Écrivez le prompt modèle ici..."
            />
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 text-sm text-[var(--srg-text-muted)]">
          <p className="font-semibold text-[var(--srg-text-title)]">Validation</p>
          <p className="mt-3">Nom : {name}</p>
          <p>Catégorie : {category}</p>
          <p>Description : {description}</p>
          <p>Tags : {tags}</p>
          <p>Variables : {variables.length}</p>
          <p className="mt-3">Prompt : {content ? 'Prêt' : 'Vide'}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:bg-[var(--srg-surface)]"
        >
          Fermer
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isStepValid}
          className="rounded-3xl bg-[var(--srg-color-primary-500)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {step === 4 ? 'Créer le template' : 'Suivant'}
        </button>
      </div>
    </div>
  )
}
