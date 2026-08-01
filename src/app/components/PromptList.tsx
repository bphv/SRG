import type { Prompt } from '#/app/services/PromptService'
import PromptStatusBadge from '#/app/components/PromptStatusBadge'
import PromptFavoriteButton from '#/app/components/PromptFavoriteButton'

export default function PromptList({
  prompts,
  onSelect,
  onFavorite,
}: {
  prompts: Prompt[]
  onSelect: (id: string) => void
  onFavorite: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div key={prompt.id} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">{prompt.category}</p>
              <h3 className="text-xl font-semibold text-[var(--srg-text-title)]">{prompt.name}</h3>
              <p className="text-sm text-[var(--srg-text-muted)]">{prompt.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PromptStatusBadge status={prompt.status} />
              <PromptFavoriteButton prompt={prompt} onToggle={() => onFavorite(prompt.id)} />
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-4 text-sm text-[var(--srg-text-muted)]">
            <div>
              <p>Projet</p>
              <p className="mt-1 text-[var(--srg-text-title)]">{prompt.projectId}</p>
            </div>
            <div>
              <p>Provider</p>
              <p className="mt-1 text-[var(--srg-text-title)]">{prompt.provider}</p>
            </div>
            <div>
              <p>Model</p>
              <p className="mt-1 text-[var(--srg-text-title)]">{prompt.model}</p>
            </div>
            <div>
              <p>Dernière utilisation</p>
              <p className="mt-1 text-[var(--srg-text-title)]">{prompt.lastRunAt}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onSelect(prompt.id)}
              className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
            >
              Éditer
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
