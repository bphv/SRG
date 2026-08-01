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
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--srg-color-primary-500)]">{project.provider}</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--srg-text-title)]">{project.name}</h3>
          <p className="mt-2 text-sm text-[var(--srg-text-muted)] line-clamp-2">{project.description}</p>
        </div>
        <button type="button" onClick={onFavorite} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]">
          {project.favorite ? '★' : '☆'}
        </button>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-[var(--srg-text-muted)] sm:grid-cols-2">
        <div>
          <p>Date création</p>
          <p className="mt-1 text-[var(--srg-text-title)]">{project.createdAt}</p>
        </div>
        <div>
          <p>Dernière modif</p>
          <p className="mt-1 text-[var(--srg-text-title)]">{project.updatedAt}</p>
        </div>
        <div>
          <p>Générations</p>
          <p className="mt-1 text-[var(--srg-text-title)]">{project.generationCount}</p>
        </div>
        <div>
          <p>Prompts</p>
          <p className="mt-1 text-[var(--srg-text-title)]">{project.promptCount}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs font-medium text-[var(--srg-text-muted)]">{project.language}</span>
        </div>
        <Link
          to="/projects"
          className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
          onClick={onSelect}
        >
          Ouvrir
        </Link>
      </div>
    </div>
  )
}
