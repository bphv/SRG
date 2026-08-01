import { Link } from '@tanstack/react-router'

const actions = [
  { id: 'quick-1', label: 'Créer un projet', href: '/projects' },
  { id: 'quick-2', label: 'Créer un prompt', href: '/prompt-studio' },
  { id: 'quick-3', label: 'Nouvelle génération', href: '/generate' },
  { id: 'quick-4', label: 'Knowledge Center', href: '/knowledge-center' },
  { id: 'quick-5', label: 'Providers', href: '/providers' },
  { id: 'quick-6', label: 'Historique', href: '/history' },
  { id: 'quick-7', label: 'Procurement & Inventory', href: '/procurement-inventory' },
  { id: 'quick-8', label: 'Maintenance', href: '/maintenance' },
  { id: 'quick-9', label: 'Finance', href: '/finance' },
  { id: 'quick-10', label: 'Ressources Humaines', href: '/human-resources' },
]

export default function QuickActions() {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Actions rapides</p>
        <p className="text-sm text-[var(--srg-text-muted)]">Accès direct aux tâches SRG courantes.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.href}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)] hover:bg-[var(--srg-surface)]"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
