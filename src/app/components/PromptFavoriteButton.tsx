import type { Prompt } from '#/app/services/PromptService'

export default function PromptFavoriteButton({
  prompt,
  onToggle,
}: {
  prompt: Prompt
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
    >
      {prompt.favorite ? '★ Favori' : '☆ Favori'}
    </button>
  )
}
