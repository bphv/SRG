export default function TemplateFavoriteButton({
  favorite,
  onToggle,
}: {
  favorite: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
    >
      <span className="text-[var(--srg-color-primary-600)]">{favorite ? '★' : '☆'}</span>
      {favorite ? 'Favori' : 'Favori'}
    </button>
  )
}
