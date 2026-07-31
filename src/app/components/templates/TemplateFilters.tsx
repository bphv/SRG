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
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Filtres</h3>
      <div className="mt-5 space-y-4 text-sm text-[var(--sea-ink-soft)]">
        <div>
          <label className="mb-2 block font-semibold text-[var(--sea-ink)]">Catégorie</label>
          <input
            value={category}
            onChange={(event) => onChange({ category: event.target.value })}
            className="w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            placeholder="Toutes les catégories"
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-[var(--sea-ink)]">Provider</label>
          <input
            value={provider}
            onChange={(event) => onChange({ provider: event.target.value })}
            className="w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            placeholder="Tous les providers"
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-[var(--sea-ink)]">Version</label>
          <input
            value={version}
            onChange={(event) => onChange({ version: event.target.value })}
            className="w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            placeholder="Toutes versions"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)]">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(event) => onChange({ favoritesOnly: event.target.checked })}
              className="rounded border-[var(--line)] bg-[var(--surface)]"
            />
            Favoris uniquement
          </label>
          <label className="inline-flex items-center gap-2 rounded-3xl bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)]">
            <input
              type="checkbox"
              checked={archivedOnly}
              onChange={(event) => onChange({ archivedOnly: event.target.checked })}
              className="rounded border-[var(--line)] bg-[var(--surface)]"
            />
            Archivés uniquement
          </label>
        </div>
        <div>
          <label className="mb-2 block font-semibold text-[var(--sea-ink)]">Langue</label>
          <input
            value={language}
            onChange={(event) => onChange({ language: event.target.value })}
            className="w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            placeholder="Toutes les langues"
          />
        </div>
      </div>
    </div>
  )
}
