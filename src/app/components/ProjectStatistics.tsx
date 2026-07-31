import type { Project } from '#/app/services/ProjectService'

export default function ProjectStatistics({ projects }: { projects: Project[] }) {
  const total = projects.length
  const favorites = projects.filter((project) => project.favorite).length
  const archived = projects.filter((project) => project.status === 'archived').length
  const active = projects.filter((project) => project.status === 'active').length
  const averageGenerations = total ? Math.round(projects.reduce((sum, project) => sum + project.generationCount, 0) / total) : 0

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Total projets</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--sea-ink)]">{total}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Actifs</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--sea-ink)]">{active}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Archivés</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--sea-ink)]">{archived}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Favoris</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--sea-ink)]">{favorites}</p>
        </div>
      </div>
      <div className="mt-5 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]">
        Moyenne de générations par projet : <span className="font-semibold text-[var(--sea-ink)]">{averageGenerations}</span>
      </div>
    </div>
  )
}
