import type { Prompt } from '#/app/services/PromptService'
import { replaceVariables } from '#/app/services/PromptPreviewService'

export default function PromptPreview({ prompt, variables }: { prompt: Prompt | null; variables: Record<string, string> }) {
  if (!prompt) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 text-[var(--sea-ink-soft)]">
        Prévisualisation disponible après sélection d’un prompt.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Prévisualisation</p>
        <p className="text-sm text-[var(--sea-ink-soft)]">Prompt final après injection des variables.</p>
      </div>
      <pre className="whitespace-pre-wrap break-words rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink)] font-mono">
        {replaceVariables(prompt.content, variables)}
      </pre>
    </div>
  )
}
