import type { Prompt } from '#/app/services/PromptService'
import { replaceVariables } from '#/app/services/PromptPreviewService'

export default function PromptPreview({ prompt, variables }: { prompt: Prompt | null; variables: Record<string, string> }) {
  if (!prompt) {
    return (
      <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 text-[var(--srg-text-muted)]">
        Prévisualisation disponible après sélection d’un prompt.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Prévisualisation</p>
        <p className="text-sm text-[var(--srg-text-muted)]">Prompt final après injection des variables.</p>
      </div>
      <pre className="whitespace-pre-wrap break-words rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-title)] font-mono">
        {replaceVariables(prompt.content, variables)}
      </pre>
    </div>
  )
}
