import type { Project } from '#/app/services/ProjectService'

export default function ProjectStatistics({ projects }: { projects: Project[] }) {
  const total = projects.length
  const favorites = projects.filter((project) => project.favorite).length
  const archived = projects.filter((project) => project.status === 'archived').length
  const active = projects.filter((project) => project.status === 'active').length
  const averageGenerations = total ? Math.round(projects.reduce((sum, project) => sum + project.generationCount, 0) / total) : 0

  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Total projets</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--srg-text-title)]">{total}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Actifs</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--srg-text-title)]">{active}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Archivés</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--srg-text-title)]">{archived}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Favoris</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--srg-text-title)]">{favorites}</p>
        </div>
      </div>
      <div className="mt-5 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
        Moyenne de générations par projet : <span className="font-semibold text-[var(--srg-text-title)]">{averageGenerations}</span>
      </div>
    </div>
  )
}
