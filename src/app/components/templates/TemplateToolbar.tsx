export default function TemplateToolbar({
  onCreate,
  onImport,
  onExport,
  onRefresh,
  onToggleView,
  viewMode,
}: {
  onCreate: () => void
  onImport: () => void
  onExport: () => void
  onRefresh: () => void
  onToggleView: () => void
  viewMode: 'grid' | 'list'
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
          >
            Créer
          </button>
          <button
            type="button"
            onClick={onImport}
            className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
          >
            Importer
          </button>
          <button
            type="button"
            onClick={onExport}
            className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
          >
            Exporter
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
          >
            Actualiser
          </button>
          <button
            type="button"
            onClick={onToggleView}
            className="rounded-3xl bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--line)]"
          >
            {viewMode === 'grid' ? 'Vue Liste' : 'Vue Grille'}
          </button>
        </div>
      </div>
    </div>
  )
}
