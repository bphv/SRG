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
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-[var(--srg-text-title)]">Aperçu du template</h2>
        <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{description}</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Prompt modèle</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--srg-text-muted)]">{content}</pre>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Prompt compilé</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--srg-text-muted)]">{compiledPrompt}</pre>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Variables</p>
          <div className="mt-3 grid gap-3">
            {variables.map((variable) => (
              <div key={variable.name} className="rounded-3xl bg-[var(--srg-surface)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-[var(--srg-text-title)]">{variable.name}</p>
                  <span className="text-xs text-[var(--srg-text-muted)]">{variable.type}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{variable.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Exemple d’entrée</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--srg-text-muted)]">{exampleInput}</pre>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Longueur approximative</p>
          <p className="mt-3 text-xl font-semibold text-[var(--srg-text-title)]">{lengthEstimate} caractères</p>
        </div>
      </div>
    </div>
  )
}
