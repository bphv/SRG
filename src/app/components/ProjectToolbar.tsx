import type { ReactNode } from 'react'
import type { ProjectFilters } from '#/app/services/ProjectService'

export default function ProjectToolbar({
  filters,
  onToggleView,
  onSortChange,
  onCreate,
  actions,
}: {
  filters: ProjectFilters
  onToggleView: () => void
  onSortChange: (sortKey: ProjectFilters['sortKey']) => void
  onCreate: () => void
  actions?: ReactNode
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={onToggleView}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
          >
            {filters.viewMode === 'grid' ? 'Vue Liste' : 'Vue Grille'}
          </button>
          <select
            value={filters.sortKey}
            onChange={(event) => onSortChange(event.target.value as ProjectFilters['sortKey'])}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm text-[var(--srg-text-title)] outline-none"
          >
            <option value="updatedAt">Dernière modification</option>
            <option value="createdAt">Date création</option>
            <option value="generationCount">Générations</option>
            <option value="name">Nom</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {actions}
          <button
            type="button"
            onClick={onCreate}
            className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
          >
            Nouveau projet
          </button>
        </div>
      </div>
    </div>
  )
}
