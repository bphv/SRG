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
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">{prompt.category}</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">{prompt.name}</h3>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)] line-clamp-2">{prompt.description}</p>
        </div>
        <PromptFavoriteButton prompt={prompt} onToggle={onFavorite} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm text-[var(--sea-ink-soft)]">
        <div>
          <p>Projet</p>
          <p className="mt-1 text-[var(--sea-ink)]">{prompt.projectId}</p>
        </div>
        <div>
          <p>Provider</p>
          <p className="mt-1 text-[var(--sea-ink)]">{prompt.provider}</p>
        </div>
        <div>
          <p>Model</p>
          <p className="mt-1 text-[var(--sea-ink)]">{prompt.model}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <PromptStatusBadge status={prompt.status} />
        <button
          type="button"
          onClick={onSelect}
          className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
        >
          Ouvrir
        </button>
      </div>
    </div>
  )
}
