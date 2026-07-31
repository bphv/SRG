import type { SystemResource } from '#/app/services/DashboardService'

export default function SystemResources({ items }: { items: SystemResource[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Ressources système</p>
        <p className="text-sm text-[var(--sea-ink-soft)]">Mesure de la performance globale.</p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-[var(--sea-ink)]">{item.label}</p>
              <p className="text-sm font-semibold text-[var(--sea-ink-soft)]">{item.value}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(23,58,64,0.06)]">
              <div className="h-full rounded-full bg-[var(--lagoon)]" style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
