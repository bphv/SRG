import type { Prompt } from '#/app/services/PromptService'
import PromptStatusBadge from '#/app/components/PromptStatusBadge'

export default function PromptMetadataPanel({ prompt }: { prompt: Prompt | null }) {
  if (!prompt) {
    return (
      <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 text-[var(--srg-text-muted)]">
        Sélectionnez un prompt pour voir ses métadonnées.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Métadonnées</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--srg-text-title)]">{prompt.name}</h3>
        </div>
        <PromptStatusBadge status={prompt.status} />
      </div>
      <div className="grid gap-4 text-sm text-[var(--srg-text-muted)]">
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Projet associé</p>
          <p>{prompt.projectId}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Provider principal</p>
          <p>{prompt.provider}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Langue</p>
          <p>{prompt.language}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Modèle</p>
          <p>{prompt.model}</p>
        </div>
      </div>
    </div>
  )
}
