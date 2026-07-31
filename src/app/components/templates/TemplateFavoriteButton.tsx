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
      className="inline-flex items-center gap-2 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
    >
      <span className="text-[var(--lagoon-deep)]">{favorite ? '★' : '☆'}</span>
      {favorite ? 'Favori' : 'Favori'}
    </button>
  )
}
