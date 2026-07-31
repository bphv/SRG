import type { Project } from '#/app/services/ProjectService'
import ProjectStatusBadge from '#/app/components/ProjectStatusBadge'

export default function ProjectDetailsPanel({ project }: { project: Project | null }) {
  if (!project) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 text-[var(--sea-ink-soft)]">
        Sélectionnez un projet pour afficher les détails.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Détails du projet</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{project.name}</h2>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="text-sm text-[var(--sea-ink-soft)]">{project.description}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Provider</p>
          <p className="mt-2 font-semibold text-[var(--sea-ink)]">{project.provider}</p>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Type</p>
          <p className="mt-2 font-semibold text-[var(--sea-ink)]">{project.type}</p>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Langue</p>
          <p className="mt-2 font-semibold text-[var(--sea-ink)]">{project.language}</p>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Favori</p>
          <p className="mt-2 font-semibold text-[var(--sea-ink)]">{project.favorite ? 'Oui' : 'Non'}</p>
        </div>
      </div>
    </div>
  )
}
