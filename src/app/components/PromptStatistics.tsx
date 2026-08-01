import type { Prompt } from '#/app/services/PromptService'

export default function PromptStatistics({ prompt }: { prompt: Prompt | null }) {
  if (!prompt) {
    return (
      <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 text-[var(--srg-text-muted)]">
        Sélectionnez un prompt pour afficher ses statistiques.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Statistiques</p>
        <p className="text-sm text-[var(--srg-text-muted)]">Mesures du prompt et performances.</p>
      </div>
      <div className="grid gap-4 text-sm text-[var(--srg-text-muted)] sm:grid-cols-2">
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Exécutions</p>
          <p>{prompt.runCount}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Temps moyen</p>
          <p>{prompt.averageLatencyMs} ms</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Dernière utilisation</p>
          <p>{prompt.lastRunAt}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Provider</p>
          <p>{prompt.provider}</p>
        </div>
      </div>
    </div>
  )
}
