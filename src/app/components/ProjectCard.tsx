import { Link } from '@tanstack/react-router'
import type { Project } from '#/app/services/ProjectService'
import ProjectStatusBadge from '#/app/components/ProjectStatusBadge'

export default function ProjectCard({
  project,
  onSelect,
  onFavorite,
}: {
  project: Project
  onSelect: () => void
  onFavorite: () => void
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--lagoon-deep)]">{project.provider}</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">{project.name}</h3>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)] line-clamp-2">{project.description}</p>
        </div>
        <button type="button" onClick={onFavorite} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]">
          {project.favorite ? '★' : '☆'}
        </button>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-[var(--sea-ink-soft)] sm:grid-cols-2">
        <div>
          <p>Date création</p>
          <p className="mt-1 text-[var(--sea-ink)]">{project.createdAt}</p>
        </div>
        <div>
          <p>Dernière modif</p>
          <p className="mt-1 text-[var(--sea-ink)]">{project.updatedAt}</p>
        </div>
        <div>
          <p>Générations</p>
          <p className="mt-1 text-[var(--sea-ink)]">{project.generationCount}</p>
        </div>
        <div>
          <p>Prompts</p>
          <p className="mt-1 text-[var(--sea-ink)]">{project.promptCount}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--sea-ink-soft)]">{project.language}</span>
        </div>
        <Link
          to="/projects"
          className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
          onClick={onSelect}
        >
          Ouvrir
        </Link>
      </div>
    </div>
  )
}
