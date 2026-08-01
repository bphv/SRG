import type { Prompt } from '#/app/services/PromptService'
import PromptFavoriteButton from '#/app/components/PromptFavoriteButton'
import PromptStatusBadge from '#/app/components/PromptStatusBadge'

export default function PromptExplorer({
  prompts,
  selectedPromptId,
  onSelect,
  onFavorite,
}: {
  prompts: Prompt[]
  selectedPromptId: string | null
  onSelect: (id: string) => void
  onFavorite: (id: string) => void
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Bibliothèque des prompts</p>
          <p className="text-sm text-[var(--srg-text-muted)]">Recherche, filtre et sélection.</p>
        </div>
      </div>
      <div className="space-y-3">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSelect(prompt.id)}
            className={`w-full rounded-[1.75rem] border px-4 py-4 text-left transition ${
              selectedPromptId === prompt.id ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-surface-strong)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface)] hover:border-[var(--srg-color-primary-400)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-[var(--srg-text-title)]">{prompt.name}</h4>
                <p className="mt-1 text-sm text-[var(--srg-text-muted)] line-clamp-2">{prompt.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <PromptStatusBadge status={prompt.status} />
                <PromptFavoriteButton prompt={prompt} onToggle={() => onFavorite(prompt.id)} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
