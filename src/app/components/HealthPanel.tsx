import type { HealthItem } from '#/app/services/DashboardService'
import StatusBadge from '#/app/components/StatusBadge'

export default function HealthPanel({ items }: { items: HealthItem[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Santé du système</p>
        <p className="text-sm text-[var(--srg-text-muted)]">Status des principales composantes SRG.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--srg-text-title)]">{item.title}</p>
                <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{item.description}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
