import type { Prompt } from '#/app/services/PromptService'
import PromptStatusBadge from '#/app/components/PromptStatusBadge'
import PromptFavoriteButton from '#/app/components/PromptFavoriteButton'

export default function PromptCard({
  prompt,
  onSelect,
  onFavorite,
}: {
  prompt: Prompt
  onSelect: () => void
  onFavorite: () => void
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">{prompt.category}</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--srg-text-title)]">{prompt.name}</h3>
          <p className="mt-2 text-sm text-[var(--srg-text-muted)] line-clamp-2">{prompt.description}</p>
        </div>
        <PromptFavoriteButton prompt={prompt} onToggle={onFavorite} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm text-[var(--srg-text-muted)]">
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
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <PromptStatusBadge status={prompt.status} />
        <button
          type="button"
          onClick={onSelect}
          className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
        >
          Ouvrir
        </button>
      </div>
    </div>
  )
}
