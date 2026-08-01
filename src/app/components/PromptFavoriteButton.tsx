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
      className="inline-flex items-center rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
    >
      {prompt.favorite ? '★ Favori' : '☆ Favori'}
    </button>
  )
}
