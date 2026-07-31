import { Link } from '@tanstack/react-router'

const actions = [
  { id: 'quick-1', label: 'Créer un projet', href: '/projects' },
  { id: 'quick-2', label: 'Créer un prompt', href: '/prompt-studio' },
  { id: 'quick-3', label: 'Nouvelle génération', href: '/generate' },
  { id: 'quick-4', label: 'Knowledge Center', href: '/knowledge-center' },
  { id: 'quick-5', label: 'Providers', href: '/providers' },
  { id: 'quick-6', label: 'Historique', href: '/history' },
]

export default function QuickActions() {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Actions rapides</p>
        <p className="text-sm text-[var(--sea-ink-soft)]">Accès direct aux tâches SRG courantes.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.href}
            className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)] hover:bg-[var(--surface)]"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
