import type { SystemResource } from '#/app/services/DashboardService'

export default function SystemResources({ items }: { items: SystemResource[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Ressources système</p>
        <p className="text-sm text-[var(--srg-text-muted)]">Mesure de la performance globale.</p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-[var(--srg-text-title)]">{item.label}</p>
              <p className="text-sm font-semibold text-[var(--srg-text-muted)]">{item.value}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(23,58,64,0.06)]">
              <div className="h-full rounded-full bg-[var(--srg-color-primary-400)]" style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
