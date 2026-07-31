import type { OverviewData } from '#/app/services/DashboardService'

export default function OverviewCard({ overview }: { overview: OverviewData }) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Bienvenue</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--sea-ink)]">Bonjour {overview.userName}</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{overview.date} • {overview.time}</p>
        </div>
        <button className="rounded-3xl bg-[var(--lagoon-deep)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(79,184,178,0.18)] transition hover:bg-[var(--palm)]">
          Nouvelle génération
        </button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Provider actif</p>
          <p className="mt-2 text-lg font-semibold text-[var(--sea-ink)]">{overview.activeProvider}</p>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Thème actif</p>
          <p className="mt-2 text-lg font-semibold text-[var(--sea-ink)]">{overview.theme}</p>
        </div>
      </div>
    </div>
  )
}
