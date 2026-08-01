import type { Project } from '#/app/services/ProjectService'
import ProjectStatusBadge from '#/app/components/ProjectStatusBadge'

export default function ProjectDetailsPanel({ project }: { project: Project | null }) {
  if (!project) {
    return (
      <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 text-[var(--srg-text-muted)]">
        Sélectionnez un projet pour afficher les détails.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Détails du projet</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{project.name}</h2>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="text-sm text-[var(--srg-text-muted)]">{project.description}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Provider</p>
          <p className="mt-2 font-semibold text-[var(--srg-text-title)]">{project.provider}</p>
        </div>
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Type</p>
          <p className="mt-2 font-semibold text-[var(--srg-text-title)]">{project.type}</p>
        </div>
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Langue</p>
          <p className="mt-2 font-semibold text-[var(--srg-text-title)]">{project.language}</p>
        </div>
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Favori</p>
          <p className="mt-2 font-semibold text-[var(--srg-text-title)]">{project.favorite ? 'Oui' : 'Non'}</p>
        </div>
      </div>
    </div>
  )
}
