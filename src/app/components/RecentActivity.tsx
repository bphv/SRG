import type { ActivityItem } from '#/app/services/DashboardService'
import StatusBadge from '#/app/components/StatusBadge'

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Activité récente</p>
          <p className="text-sm text-[var(--srg-text-muted)]">Dernières actions et générateurs.</p>
        </div>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--srg-color-primary-400)] text-xl text-white">{item.icon}</span>
              <div>
                <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
                <p className="text-sm text-[var(--srg-text-muted)]">{item.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 sm:mt-0 sm:w-auto">
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--srg-text-muted)]">{item.time}</span>
              <StatusBadge status={item.status === 'success' ? 'online' : item.status === 'info' ? 'unknown' : item.status === 'warning' ? 'warning' : 'offline'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
