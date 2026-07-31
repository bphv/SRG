import type { HealthItem } from '#/app/services/DashboardService'
import StatusBadge from '#/app/components/StatusBadge'

export default function HealthPanel({ items }: { items: HealthItem[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Santé du système</p>
        <p className="text-sm text-[var(--sea-ink-soft)]">Status des principales composantes SRG.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">{item.title}</p>
                <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{item.description}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
