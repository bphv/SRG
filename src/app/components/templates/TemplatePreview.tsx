import type { TemplateVariable } from '#/app/components/templates/TemplateVariables'
import { useMemo } from 'react'

export default function TemplatePreview({
  description,
  content,
  variables,
  exampleInput,
  compiledPrompt,
}: {
  description: string
  content: string
  variables: TemplateVariable[]
  exampleInput: string
  compiledPrompt: string
}) {
  const lengthEstimate = useMemo(() => content.length + exampleInput.length, [content, exampleInput])

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-[var(--sea-ink)]">Aperçu du template</h2>
        <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">{description}</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Prompt modèle</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--sea-ink-soft)]">{content}</pre>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Prompt compilé</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--sea-ink-soft)]">{compiledPrompt}</pre>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Variables</p>
          <div className="mt-3 grid gap-3">
            {variables.map((variable) => (
              <div key={variable.name} className="rounded-3xl bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-[var(--sea-ink)]">{variable.name}</p>
                  <span className="text-xs text-[var(--sea-ink-soft)]">{variable.type}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{variable.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Exemple d’entrée</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--sea-ink-soft)]">{exampleInput}</pre>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Longueur approximative</p>
          <p className="mt-3 text-xl font-semibold text-[var(--sea-ink)]">{lengthEstimate} caractères</p>
        </div>
      </div>
    </div>
  )
}
