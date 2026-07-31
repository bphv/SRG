import type { Prompt } from '#/app/services/PromptService'

export default function PromptStatistics({ prompt }: { prompt: Prompt | null }) {
  if (!prompt) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 text-[var(--sea-ink-soft)]">
        Sélectionnez un prompt pour afficher ses statistiques.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Statistiques</p>
        <p className="text-sm text-[var(--sea-ink-soft)]">Mesures du prompt et performances.</p>
      </div>
      <div className="grid gap-4 text-sm text-[var(--sea-ink-soft)] sm:grid-cols-2">
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Exécutions</p>
          <p>{prompt.runCount}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Temps moyen</p>
          <p>{prompt.averageLatencyMs} ms</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Dernière utilisation</p>
          <p>{prompt.lastRunAt}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Provider</p>
          <p>{prompt.provider}</p>
        </div>
      </div>
    </div>
  )
}
