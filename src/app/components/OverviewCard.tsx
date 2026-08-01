import type { OverviewData } from '#/app/services/DashboardService'

export default function OverviewCard({ overview }: { overview: OverviewData }) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Bienvenue</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--srg-text-title)]">Bonjour {overview.userName}</h2>
          <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{overview.date} • {overview.time}</p>
        </div>
        <button className="rounded-3xl bg-[var(--srg-color-primary-500)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(79,184,178,0.18)] transition hover:bg-[var(--srg-color-primary-600)]">
          Nouvelle génération
        </button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Provider actif</p>
          <p className="mt-2 text-lg font-semibold text-[var(--srg-text-title)]">{overview.activeProvider}</p>
        </div>
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Thème actif</p>
          <p className="mt-2 text-lg font-semibold text-[var(--srg-text-title)]">{overview.theme}</p>
        </div>
      </div>
    </div>
  )
}
