export default function TemplateFilters({
  category,
  provider,
  version,
  favoritesOnly,
  archivedOnly,
  language,
  onChange,
}: {
  category: string
  provider: string
  version: string
  favoritesOnly: boolean
  archivedOnly: boolean
  language: string
  onChange: (updated: Partial<{ category: string; provider: string; version: string; favoritesOnly: boolean; archivedOnly: boolean; language: string }>) => void
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
      <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Filtres</h3>
      <div className="mt-5 space-y-4 text-sm text-[var(--srg-text-muted)]">
        <div>
          <label className="mb-2 block font-semibold text-[var(--srg-text-title)]">Catégorie</label>
          <input
            value={category}
            onChange={(event) => onChange({ category: event.target.value })}
            className="w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            placeholder="Toutes les catégories"
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-[var(--srg-text-title)]">Provider</label>
          <input
            value={provider}
            onChange={(event) => onChange({ provider: event.target.value })}
            className="w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            placeholder="Tous les providers"
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-[var(--srg-text-title)]">Version</label>
          <input
            value={version}
            onChange={(event) => onChange({ version: event.target.value })}
            className="w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            placeholder="Toutes versions"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)]">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(event) => onChange({ favoritesOnly: event.target.checked })}
              className="rounded border-[var(--srg-border)] bg-[var(--srg-surface)]"
            />
            Favoris uniquement
          </label>
          <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)]">
            <input
              type="checkbox"
              checked={archivedOnly}
              onChange={(event) => onChange({ archivedOnly: event.target.checked })}
              className="rounded border-[var(--srg-border)] bg-[var(--srg-surface)]"
            />
            Archivés uniquement
          </label>
        </div>
        <div>
          <label className="mb-2 block font-semibold text-[var(--srg-text-title)]">Langue</label>
          <input
            value={language}
            onChange={(event) => onChange({ language: event.target.value })}
            className="w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            placeholder="Toutes les langues"
          />
        </div>
      </div>
    </div>
  )
}
