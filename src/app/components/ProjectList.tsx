import type { Project } from '#/app/services/ProjectService'
import ProjectStatusBadge from '#/app/components/ProjectStatusBadge'

export default function ProjectList({
  projects,
  onSelect,
  onFavorite,
}: {
  projects: Project[]
  onSelect: (id: string) => void
  onFavorite: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">{project.provider}</p>
              <h3 className="text-xl font-semibold text-[var(--srg-text-title)]">{project.name}</h3>
              <p className="text-sm text-[var(--srg-text-muted)]">{project.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs font-medium text-[var(--srg-text-muted)]">{project.language}</span>
              <button
                type="button"
                onClick={() => onFavorite(project.id)}
                className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
              >
                {project.favorite ? '★' : '☆'} Favori
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-4 text-sm text-[var(--srg-text-muted)]">
            <div>
              <p>Créé</p>
              <p className="mt-1 text-[var(--srg-text-title)]">{project.createdAt}</p>
            </div>
            <div>
              <p>Mis à jour</p>
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
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onSelect(project.id)}
              className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
            >
              Ouvrir
            </button>
            <button
              type="button"
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
            >
              Modifier
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
