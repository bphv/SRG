import type { Prompt } from '#/app/services/PromptService'
import PromptStatusBadge from '#/app/components/PromptStatusBadge'

export default function PromptMetadataPanel({ prompt }: { prompt: Prompt | null }) {
  if (!prompt) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 text-[var(--sea-ink-soft)]">
        Sélectionnez un prompt pour voir ses métadonnées.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Métadonnées</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">{prompt.name}</h3>
        </div>
        <PromptStatusBadge status={prompt.status} />
      </div>
      <div className="grid gap-4 text-sm text-[var(--sea-ink-soft)]">
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Projet associé</p>
          <p>{prompt.projectId}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Provider principal</p>
          <p>{prompt.provider}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Langue</p>
          <p>{prompt.language}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Modèle</p>
          <p>{prompt.model}</p>
        </div>
      </div>
    </div>
  )
}
