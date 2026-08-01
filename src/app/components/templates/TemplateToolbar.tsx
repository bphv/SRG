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
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
          >
            Créer
          </button>
          <button
            type="button"
            onClick={onImport}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
          >
            Importer
          </button>
          <button
            type="button"
            onClick={onExport}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
          >
            Exporter
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
          >
            Actualiser
          </button>
          <button
            type="button"
            onClick={onToggleView}
            className="rounded-3xl bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-border)]"
          >
            {viewMode === 'grid' ? 'Vue Liste' : 'Vue Grille'}
          </button>
        </div>
      </div>
    </div>
  )
}
